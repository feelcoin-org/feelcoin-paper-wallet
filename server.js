import express from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const app = express();

const PORT = 8082;
const RPC_URL = "http://127.0.0.1:35785/json_rpc";
const WALLET_DIR = "/home/feeladmin/feelcoin-paper-wallet/wallets";

app.use(express.json());
app.use(express.static("dist"));

async function walletRpc(method, params = {}) {
  const response = await fetch(RPC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "0",
      method,
      params
    })
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(
      data.error.message || "Feelcoin wallet RPC error"
    );
  }

  return data.result;
}

function deleteWalletFiles(filename) {
  const files = [
    path.join(WALLET_DIR, filename),
    path.join(WALLET_DIR, `${filename}.keys`),
    path.join(WALLET_DIR, `${filename}.address.txt`)
  ];

  for (const file of files) {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    } catch (error) {
      console.error(
        `Failed to remove ${file}:`,
        error.message
      );
    }
  }
}

async function closeWalletSafely() {
  try {
    await walletRpc("close_wallet");
  } catch {
    // No wallet may be open.
  }
}

app.get("/api/health", async (req, res) => {
  try {
    const result = await walletRpc("get_version");

    res.json({
      status: "ok",
      walletRpc: true,
      version: result?.version ?? null
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      walletRpc: false,
      error: error.message
    });
  }
});

app.post("/api/generate", async (req, res) => {
  const filename = `paper-${crypto.randomUUID()}`;

  try {
    await closeWalletSafely();

    await walletRpc("create_wallet", {
      filename,
      password: "",
      language: "English"
    });

    const addressResult = await walletRpc(
      "get_address",
      {
        account_index: 0
      }
    );

    const mnemonicResult = await walletRpc(
      "query_key",
      {
        key_type: "mnemonic"
      }
    );

    const spendResult = await walletRpc(
      "query_key",
      {
        key_type: "spend_key"
      }
    );

    const viewResult = await walletRpc(
      "query_key",
      {
        key_type: "view_key"
      }
    );

    const address =
      addressResult?.address ||
      addressResult?.addresses?.[0]?.address;

    const seed =
      mnemonicResult?.key;

    const spendKey =
      spendResult?.key;

    const viewKey =
      viewResult?.key;

    if (
      !address ||
      !seed ||
      !spendKey ||
      !viewKey
    ) {
      throw new Error(
        "Incomplete wallet information returned by Feelcoin wallet RPC"
      );
    }

    await closeWalletSafely();

    deleteWalletFiles(filename);

    res.json({
      success: true,
      address,
      seed,
      spendKey,
      viewKey
    });

  } catch (error) {
    console.error(
      "Wallet generation error:",
      error
    );

    await closeWalletSafely();

    deleteWalletFiles(filename);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      error: "API endpoint not found"
    });
  }

  res.sendFile(
    path.resolve(
      "/home/feeladmin/feelcoin-paper-wallet/dist/index.html"
    )
  );
});

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `Feelcoin Paper Wallet running on port ${PORT}`
    );
    console.log(
      `Open: http://162.35.27.43:${PORT}`
    );
  }
);
