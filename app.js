import express from "express";
import QRCode from "qrcode";

const app = express();
app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 3001;
const EVOLUTION_URL = process.env.EVOLUTION_URL || "https://api.evolution.local";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "default_key";
const INTERNAL_AUTH_TOKEN = process.env.INTERNAL_AUTH_TOKEN || "default_token";

const instanceStore = new Map();

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.replace("Bearer ", "").trim();

  if (!token || token !== INTERNAL_AUTH_TOKEN) {
    return res.status(401).json({
      ok: false,
      message: "Unauthorized"
    });
  }

  next();
}

async function evoFetch(path, options = {}) {
  try {
    const response = await fetch(`${EVOLUTION_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "apikey": EVOLUTION_API_KEY,
        ...(options.headers || {})
      }
    });

    const text = await response.text();

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    return {
      status: 500,
      ok: false,
      data: { error: error.message }
    };
  }
}

function normalizeQrPayload(payload) {
  const qrText =
    payload?.code ||
    payload?.base64 ||
    payload?.qrcode ||
    payload?.qr ||
    payload?.data?.code ||
    null;

  const pairingCode =
    payload?.pairingCode ||
    payload?.data?.pairingCode ||
    null;

  return { qrText, pairingCode };
}

async function buildQrResponse(instanceName, sourcePayload = {}) {
  const { qrText, pairingCode } = normalizeQrPayload(sourcePayload);

  if (!qrText) {
    return {
      ok: false,
      instanceName,
      connected: false,
      pairingCode: pairingCode || null,
      qrcode: null,
      message: "QR code ainda não disponível"
    };
  }

  try {
    const base64DataUrl = await QRCode.toDataURL(qrText, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 320
    });

    return {
      ok: true,
      instanceName,
      connected: false,
      pairingCode: pairingCode || null,
      qrcode: {
        text: qrText,
        base64: base64DataUrl
      }
    };
  } catch (error) {
    return {
      ok: false,
      instanceName,
      connected: false,
      pairingCode: pairingCode || null,
      qrcode: null,
      message: "Erro ao gerar QR: " + error.message
    };
  }
}

app.get("/public/health", (_req, res) => {
  res.json({ ok: true, service: "onboarding_api" });
});

app.post("/public/create-and-qrcode", authMiddleware, async (req, res) => {
  try {
    const {
      userId,
      instanceName,
      integration = "WHATSAPP-BAILEYS",
      number = "",
      webhookUrl = process.env.DEFAULT_WEBHOOK_URL || "",
      rejectCall = false,
      groupsIgnore = true,
      alwaysOnline = false,
      readMessages = false,
      readStatus = false,
      syncFullHistory = false
    } = req.body;

    const safeInstanceName =
      instanceName ||
      `user_${userId || "anonymous"}_${Date.now()}`;

    const createPayload = {
      instanceName: safeInstanceName,
      integration,
      token: "",
      qrcode: true,
      number,
      rejectCall,
      groupsIgnore,
      alwaysOnline,
      readMessages,
      readStatus,
      syncFullHistory,
      webhook: {
        url: webhookUrl,
        byEvents: true,
        base64: true,
        headers: {
          authorization: `Bearer ${INTERNAL_AUTH_TOKEN}`,
          "Content-Type": "application/json"
        },
        events: [
          "APPLICATION_STARTUP",
          "QRCODE_UPDATED",
          "CONNECTION_UPDATE",
          "MESSAGES_UPSERT"
        ]
      }
    };

    const created = await evoFetch("/instance/create", {
      method: "POST",
      body: JSON.stringify(createPayload)
    });

    if (!created.ok) {
      return res.status(created.status).json({
        ok: false,
        step: "create_instance",
        evolution: created.data
      });
    }

    const instanceData = created.data?.instance || {};
    const hashData = created.data?.hash || {};

    instanceStore.set(safeInstanceName, {
      userId: userId || null,
      instanceName: safeInstanceName,
      instanceId: instanceData.instanceId || null,
      instanceApiKey: hashData.apikey || null,
      status: instanceData.status || "created",
      createdAt: new Date().toISOString()
    });

    let qrResponse = await buildQrResponse(safeInstanceName, created.data);

    if (!qrResponse.ok) {
      const connected = await evoFetch(`/instance/connect/${safeInstanceName}`, {
        method: "GET"
      });

      if (connected.ok) {
        qrResponse = await buildQrResponse(safeInstanceName, connected.data);
      }
    }

    return res.json({
      ok: true,
      instance: {
        instanceName: safeInstanceName,
        instanceId: instanceData.instanceId || null,
        status: instanceData.status || "created",
        instanceApiKey: hashData.apikey || null
      },
      qr: qrResponse
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

app.get("/public/qrcode/:instanceName", authMiddleware, async (req, res) => {
  try {
    const { instanceName } = req.params;

    const connected = await evoFetch(`/instance/connect/${instanceName}`, {
      method: "GET"
    });

    if (!connected.ok) {
      return res.status(connected.status).json({
        ok: false,
        step: "connect_instance",
        evolution: connected.data
      });
    }

    const qrResponse = await buildQrResponse(instanceName, connected.data);

    return res.json(qrResponse);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

app.get("/public/status/:instanceName", authMiddleware, async (req, res) => {
  try {
    const { instanceName } = req.params;
    const local = instanceStore.get(instanceName) || null;

    return res.json({
      ok: true,
      local
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

app.post("/public/webhook/evolution", async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.replace("Bearer ", "").trim();

    if (token !== INTERNAL_AUTH_TOKEN) {
      return res.status(401).json({ ok: false, message: "Unauthorized webhook" });
    }

    const body = req.body || {};

    const event =
      body.event ||
      body.type ||
      body.data?.event ||
      null;

    const instanceName =
      body.instance ||
      body.instanceName ||
      body.data?.instance ||
      body.data?.instanceName ||
      null;

    if (instanceName && instanceStore.has(instanceName)) {
      const current = instanceStore.get(instanceName);

      instanceStore.set(instanceName, {
        ...current,
        lastEvent: event,
        lastWebhookAt: new Date().toISOString(),
        webhookPayload: body
      });

      const serialized = JSON.stringify(body).toLowerCase();
      if (
        serialized.includes("open") ||
        serialized.includes("connected") ||
        serialized.includes("qrreadsuccess")
      ) {
        instanceStore.set(instanceName, {
          ...instanceStore.get(instanceName),
          connected: true,
          status: "connected"
        });
      }
    }

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`onboarding_api running on port ${PORT}`);
});
