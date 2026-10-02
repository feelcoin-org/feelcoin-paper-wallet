import "./style.css";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";

const app = document.querySelector("#app");

let currentWallet = null;
let privateVisible = true;

app.innerHTML = `
<main class="page">

  <section class="hero">
    <img
      src="/feelcoin-logo.jpeg"
      class="logo"
      alt="Feelcoin"
    />

    <h1>Feelcoin Paper Wallet</h1>
    <p class="tagline">In Feels We Trust</p>

    <div class="notice">
      Generate a new Feelcoin wallet and store the recovery information securely.
      Never share your recovery seed or private spend key.
    </div>
  </section>

  <section class="wallet-card" id="paperWallet">

    <img
      src="/feelcoin-logo.jpeg"
      class="watermark"
      alt=""
    />

    <div class="wallet-top">
      <div>
        <div class="brand">FEELCOIN</div>
        <div class="subtitle">Paper Wallet</div>
      </div>

      <div class="status-badge">
        In Feels We Trust
      </div>
    </div>

    <div id="emptyState" class="empty-state">
      <div class="empty-icon">F</div>

      <h2>Create your Feelcoin wallet</h2>

      <p>
        Press Generate New Wallet to create a fresh Feelcoin address,
        recovery seed and private keys.
      </p>
    </div>

    <div id="walletData" class="wallet-data hidden">

      <div class="address-layout">

        <div class="data-box">
          <div class="data-label">Public Address</div>

          <div
            class="data-value address-value"
            id="address"
          ></div>

          <button
            id="copyAddress"
            class="small-button"
          >
            Copy Address
          </button>
        </div>

        <div class="qr-box">
          <canvas id="addressQr"></canvas>
          <span>PUBLIC ADDRESS</span>
        </div>

      </div>

      <div class="secret-box">

        <div class="secret-heading">
          <div>
            <div class="data-label">Recovery Seed</div>
            <div class="secret-description">
              Use this seed to restore your wallet.
            </div>
          </div>
        </div>

        <div
          class="data-value seed-value private-data"
          id="seed"
        ></div>

        <button
          class="small-button copy-secret"
          data-target="seed"
        >
          Copy Seed
        </button>

      </div>

      <div class="secret-box">

        <div class="data-label">
          Private Spend Key
        </div>

        <div
          class="data-value private-data"
          id="spendKey"
        ></div>

        <button
          class="small-button copy-secret"
          data-target="spendKey"
        >
          Copy Spend Key
        </button>

      </div>

      <div class="secret-box">

        <div class="data-label">
          Private View Key
        </div>

        <div
          class="data-value private-data"
          id="viewKey"
        ></div>

        <button
          class="small-button copy-secret"
          data-target="viewKey"
        >
          Copy View Key
        </button>

      </div>

    </div>

    <div class="actions">

      <button
        id="generate"
        class="button primary"
      >
        Generate New Wallet
      </button>

      <button
        id="togglePrivate"
        class="button secondary"
        disabled
      >
        Hide Private Data
      </button>

      <button
        id="downloadPdf"
        class="button secondary"
        disabled
      >
        Download PDF
      </button>

      <button
        id="printWallet"
        class="button secondary"
        disabled
      >
        Print Wallet
      </button>

    </div>

  </section>

  <section class="security-section">

    <h3>Security</h3>

    <div class="security-grid">

      <div class="security-item">
        <strong>Recovery Seed</strong>
        <span>
          Anyone with your recovery seed can restore and control your wallet.
        </span>
      </div>

      <div class="security-item">
        <strong>Private Spend Key</strong>
        <span>
          Never share this key. It can authorize spending.
        </span>
      </div>

      <div class="security-item">
        <strong>Paper Storage</strong>
        <span>
          Store printed copies somewhere private, dry and secure.
        </span>
      </div>

    </div>

  </section>

  <footer>
    Feelcoin — In Feels We Trust
  </footer>

</main>
`;

const generateButton =
  document.querySelector("#generate");

const toggleButton =
  document.querySelector("#togglePrivate");

const pdfButton =
  document.querySelector("#downloadPdf");

const printButton =
  document.querySelector("#printWallet");

const walletData =
  document.querySelector("#walletData");

const emptyState =
  document.querySelector("#emptyState");


generateButton.addEventListener(
  "click",
  generateWallet
);


async function generateWallet() {

  const confirmed =
    !currentWallet ||
    confirm(
      "Generate a new wallet? The currently displayed wallet will be replaced."
    );

  if (!confirmed) {
    return;
  }

  generateButton.disabled = true;
  generateButton.textContent =
    "Generating Wallet...";

  try {

    const response =
      await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        }
      });

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        "Wallet generation failed"
      );
    }

    if (
      !data.address ||
      !data.seed ||
      !data.spendKey ||
      !data.viewKey
    ) {
      throw new Error(
        "Wallet server returned incomplete data"
      );
    }

    currentWallet = data;

    renderWallet();

  } catch (error) {

    console.error(error);

    alert(
      "Unable to generate wallet:\n\n" +
      error.message
    );

  } finally {

    generateButton.disabled = false;

    generateButton.textContent =
      "Generate New Wallet";
  }
}


async function renderWallet() {

  document.querySelector(
    "#address"
  ).textContent =
    currentWallet.address;

  document.querySelector(
    "#seed"
  ).textContent =
    currentWallet.seed;

  document.querySelector(
    "#spendKey"
  ).textContent =
    currentWallet.spendKey;

  document.querySelector(
    "#viewKey"
  ).textContent =
    currentWallet.viewKey;

  const canvas =
    document.querySelector(
      "#addressQr"
    );

  await QRCode.toCanvas(
    canvas,
    currentWallet.address,
    {
      width: 210,
      margin: 1,
      errorCorrectionLevel: "M"
    }
  );

  emptyState.classList.add(
    "hidden"
  );

  walletData.classList.remove(
    "hidden"
  );

  toggleButton.disabled = false;
  pdfButton.disabled = false;
  printButton.disabled = false;

  privateVisible = true;

  setPrivateVisibility();
}


toggleButton.addEventListener(
  "click",
  () => {

    if (!currentWallet) {
      return;
    }

    privateVisible =
      !privateVisible;

    setPrivateVisibility();

  }
);


function setPrivateVisibility() {

  document
    .querySelectorAll(
      ".private-data"
    )
    .forEach(element => {

      element.classList.toggle(
        "blurred",
        !privateVisible
      );

    });

  toggleButton.textContent =
    privateVisible
      ? "Hide Private Data"
      : "Show Private Data";
}


document
  .querySelector("#copyAddress")
  .addEventListener(
    "click",
    async event => {

      if (!currentWallet) {
        return;
      }

      await copyText(
        currentWallet.address,
        event.currentTarget
      );

    }
  );


document
  .querySelectorAll(
    ".copy-secret"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      async event => {

        const target =
          event.currentTarget.dataset.target;

        const text =
          document.querySelector(
            "#" + target
          ).textContent;

        await copyText(
          text,
          event.currentTarget
        );

      }
    );

  });


async function copyText(
  text,
  button
) {

  try {

    await navigator.clipboard.writeText(
      text
    );

    const oldText =
      button.textContent;

    button.textContent =
      "Copied ✓";

    setTimeout(
      () => {
        button.textContent =
          oldText;
      },
      1400
    );

  } catch {

    alert(
      "Copy failed. Select the value manually."
    );

  }
}


printButton.addEventListener(
  "click",
  () => {

    if (!currentWallet) {
      return;
    }

    window.print();

  }
);


pdfButton.addEventListener(
  "click",
  createPdf
);


async function createPdf() {

  if (!currentWallet) {
    return;
  }

  pdfButton.disabled = true;
  pdfButton.textContent =
    "Creating PDF...";

  try {

    const doc =
      new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

    const width =
      doc.internal.pageSize.getWidth();

    const margin = 18;

    try {

      const logo =
        await imageToDataUrl(
          "/feelcoin-logo.jpeg"
        );

      doc.addImage(
        logo,
        "PNG",
        width / 2 - 17,
        12,
        34,
        34
      );

    } catch (error) {

      console.warn(
        "PDF logo unavailable",
        error
      );

    }

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(23);

    doc.text(
      "FEELCOIN",
      width / 2,
      55,
      {
        align: "center"
      }
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(15);

    doc.text(
      "Paper Wallet",
      width / 2,
      64,
      {
        align: "center"
      }
    );

    doc.setFontSize(9);

    doc.text(
      "In Feels We Trust",
      width / 2,
      71,
      {
        align: "center"
      }
    );

    doc.line(
      margin,
      78,
      width - margin,
      78
    );

    let y = 88;

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(9);

    doc.text(
      "PUBLIC ADDRESS",
      margin,
      y
    );

    doc.setFont(
      "courier",
      "normal"
    );

    doc.setFontSize(7.5);

    const addressLines =
      doc.splitTextToSize(
        currentWallet.address,
        115
      );

    doc.text(
      addressLines,
      margin,
      y + 7
    );

    const qr =
      await QRCode.toDataURL(
        currentWallet.address,
        {
          width: 500,
          margin: 1
        }
      );

    doc.addImage(
      qr,
      "PNG",
      150,
      83,
      40,
      40
    );

    y = 133;

    doc.line(
      margin,
      y,
      width - margin,
      y
    );

    y += 11;

    y = addPdfSection(
      doc,
      "RECOVERY SEED",
      currentWallet.seed,
      y,
      width,
      margin
    );

    y = addPdfSection(
      doc,
      "PRIVATE SPEND KEY",
      currentWallet.spendKey,
      y,
      width,
      margin
    );

    y = addPdfSection(
      doc,
      "PRIVATE VIEW KEY",
      currentWallet.viewKey,
      y,
      width,
      margin
    );

    doc.line(
      margin,
      y,
      width - margin,
      y
    );

    y += 10;

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(9);

    doc.text(
      "SECURITY WARNING",
      margin,
      y
    );

    y += 7;

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8);

    const warning =
      doc.splitTextToSize(
        "Keep this document private. Anyone with the recovery seed or private spend key can control the funds stored in this wallet.",
        width - margin * 2
      );

    doc.text(
      warning,
      margin,
      y
    );

    doc.setFontSize(8);

    doc.text(
      "Feelcoin — In Feels We Trust",
      width / 2,
      286,
      {
        align: "center"
      }
    );

    const shortAddress =
      currentWallet.address.slice(
        0,
        8
      );

    doc.save(
      `Feelcoin-Paper-Wallet-${shortAddress}.pdf`
    );

  } catch (error) {

    console.error(error);

    alert(
      "PDF generation failed:\n\n" +
      error.message
    );

  } finally {

    pdfButton.disabled = false;

    pdfButton.textContent =
      "Download PDF";
  }
}


function addPdfSection(
  doc,
  title,
  text,
  y,
  pageWidth,
  margin
) {

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(9);

  doc.text(
    title,
    margin,
    y
  );

  y += 7;

  doc.setFont(
    "courier",
    "normal"
  );

  doc.setFontSize(8);

  const lines =
    doc.splitTextToSize(
      text,
      pageWidth -
      margin * 2
    );

  doc.text(
    lines,
    margin,
    y
  );

  return (
    y +
    lines.length * 4.5 +
    11
  );
}


async function imageToDataUrl(
  url
) {

  const response =
    await fetch(url);

  if (!response.ok) {
    throw new Error(
      "Image load failed"
    );
  }

  const blob =
    await response.blob();

  return await new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();

      reader.onload =
        () =>
          resolve(
            reader.result
          );

      reader.onerror =
        reject;

      reader.readAsDataURL(
        blob
      );

    }
  );
}
