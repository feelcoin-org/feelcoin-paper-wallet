import "./style.css";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { drawCopySafePdfValue } from "./pdf-copy.js";

const app = document.querySelector("#app");

let currentWallet = null;
let privateVisible = true;

app.innerHTML = `
<main class="page">

  <section class="hero">
    <a
      href="https://paper.feelcoin.org"
      class="home-logo-link"
      title="Return to Paper Wallet Home"
      aria-label="Return to Paper Wallet Home"
    >
      <img
        src="/assets/feelcoin-logo-v2.png"
        class="logo"
        alt="Feelcoin"
      />
    </a>

    <h1>Feelcoin Paper Wallet</h1>
    <p class="tagline">In Feels We Trust</p>

    <div class="notice">
      Generate a new Feelcoin wallet and store the recovery information securely.
      Never share your recovery seed or private spend key.
    </div>
  </section>

  <section class="wallet-card" id="paperWallet">

    <img
      src="/assets/feelcoin-logo-v2.png"
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
  if (!currentWallet) return;

  pdfButton.disabled = true;
  pdfButton.textContent = "Preparing Your Feelcoin Paper Wallet...";

  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });

    const W = 210;
    const H = 297;

    const ink = [28, 38, 51];
    const muted = [93, 103, 115];
    const gold = [183, 131, 48];
    const paper = [251, 249, 245];

    function textColor(rgb) {
      doc.setTextColor(...rgb);
    }

    function stroke(rgb = gold, width = 0.3) {
      doc.setDrawColor(...rgb);
      doc.setLineWidth(width);
    }

    function label(value, x, y) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      textColor(gold);
      doc.text(value, x, y);
    }

    function panel(x, y, w, h) {
      doc.setFillColor(255, 255, 255);
      stroke([220, 211, 195], 0.3);
      doc.roundedRect(x, y, w, h, 3, 3, "FD");
    }

    function lines(value, width, fontSize = 9) {
      doc.setFont("courier", "normal");
      doc.setFontSize(fontSize);
      return doc.splitTextToSize(String(value), width);
    }

    async function loadLogo() {
      const image = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = "/assets/feelcoin-logo-v2.png";
      });

      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);

      return canvas.toDataURL("image/png");
    }

    // Clean paper background: no Community artwork or banknote.
    doc.setFillColor(...paper);
    doc.rect(0, 0, W, H, "F");

    // Fine accent across the top.
    doc.setFillColor(...gold);
    doc.rect(0, 0, W, 2.5, "F");

    // Official Feelcoin logo.
    const logo = await loadLogo();
    doc.addImage(logo, "PNG", 17, 13, 24, 24);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(23);
    textColor(ink);
    doc.text("FEELCOIN", 47, 23);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    textColor(gold);
    doc.text("PAPER WALLET", 47, 30);

    doc.setFont("times", "italic");
    doc.setFontSize(10);
    textColor(muted);
    doc.text("In Feels We Trust", 193, 23, {
      align: "right"
    });

    stroke();
    doc.line(17, 44, 193, 44);

    // Public address section.
    label("01  PUBLIC WALLET ADDRESS", 19, 54);
    panel(17, 59, 176, 64);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    textColor(muted);
    doc.text("Use this address to receive FEEL.", 23, 69);

    const addressLines = lines(
      currentWallet.address,
      115,
      8
    );

    doc.setFont("courier", "normal");
    doc.setFontSize(8);
    textColor(ink);
    doc.text(addressLines, 23, 82);

    const qr = await QRCode.toDataURL(
      currentWallet.address,
      {
        width: 1000,
        margin: 2,
        errorCorrectionLevel: "M"
      }
    );

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(145, 70, 40, 40, 2, 2, "F");
    doc.addImage(qr, "PNG", 147, 72, 36, 36);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    textColor(muted);
    doc.text("Scan to receive", 165, 116, {
      align: "center"
    });

    // Private information heading.
    label("02  PRIVATE RECOVERY INFORMATION", 19, 138);

    doc.setFillColor(251, 239, 223);
    stroke([220, 185, 133]);
    doc.roundedRect(17, 143, 176, 16, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    textColor([123, 62, 35]);
    doc.text("CONFIDENTIAL - KEEP OFFLINE", 23, 150);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.3);
    doc.text(
      "Never share your recovery seed or private spend key.",
      23,
      155
    );

    // Recovery seed.
    panel(17, 164, 176, 43);
    label("RECOVERY SEED", 23, 173);

    const seedLines = lines(
      currentWallet.seed,
      161,
      9.2
    );

    if (seedLines.length > 5) {
      throw new Error("Recovery seed does not fit the PDF layout.");
    }

    doc.setFont("courier", "normal");
    doc.setFontSize(9.2);
    textColor(ink);
    doc.text(seedLines, 23, 184);

    // Private spend key.
    panel(17, 212, 176, 23);
    label("PRIVATE SPEND KEY", 23, 220);

    const spendLines = lines(
      currentWallet.spendKey,
      162,
      8.5
    );

    if (spendLines.length > 2) {
      throw new Error("Spend key does not fit the PDF layout.");
    }

    doc.setFont("courier", "normal");
    doc.setFontSize(8.5);
    textColor(ink);
    doc.text(spendLines, 23, 227);

    // Private view key.
    panel(17, 240, 176, 23);
    label("PRIVATE VIEW KEY", 23, 248);

    const viewLines = lines(
      currentWallet.viewKey,
      162,
      8.5
    );

    if (viewLines.length > 2) {
      throw new Error("View key does not fit the PDF layout.");
    }

    doc.setFont("courier", "normal");
    doc.setFontSize(8.5);
    textColor(ink);
    doc.text(viewLines, 23, 255);

    // Footer.
    stroke([220, 211, 195]);
    doc.line(17, 273, 193, 273);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    textColor(gold);
    doc.text("FEELCOIN", 17, 282);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    textColor(muted);
    doc.text("feelcoin.org", 17, 287);

    doc.text(
      "Anyone holding these recovery credentials may control the wallet.",
      193,
      283,
      { align: "right" }
    );

    doc.setProperties({
      title: "Feelcoin Paper Wallet",
      subject: "Feelcoin Offline Wallet Backup",
      creator: "Feelcoin Paper Wallet"
    });

    /* =====================================================
       COPY-READY PAGE (LANDSCAPE)
       The first page remains the readable printable wallet.
       The second page uses one PDF text operation per value,
       so selection does not introduce wrap-created whitespace.
       ===================================================== */
    doc.addPage("a4", "landscape");
    doc.setFillColor(247, 249, 252);
    doc.rect(0, 0, 297, 210, "F");

    doc.setTextColor(22, 37, 53);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("FEELCOIN | COPY-READY CREDENTIALS", 16, 22);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      "Select and copy the value inside each row. Do not include the label.",
      16, 31
    );

    function copyReadyRow(label, value, top, fontName, preferredSize) {
      doc.setTextColor(102, 72, 30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(label, 16, top);

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(190, 164, 106);
      doc.roundedRect(16, top + 5, 265, 18, 2, 2, "FD");

      doc.setTextColor(20, 34, 51);
      doc.setFont(fontName, "normal");
      drawCopySafePdfValue(doc, value, 19, top + 16, 259, preferredSize);
    }

    copyReadyRow(
      "PUBLIC FEELCOIN ADDRESS",
      currentWallet.address,
      40, "courier", 10
    );
    copyReadyRow(
      "PRIVATE SPEND KEY",
      currentWallet.spendKey,
      78, "courier", 10
    );
    copyReadyRow(
      "PRIVATE VIEW KEY",
      currentWallet.viewKey,
      116, "courier", 10
    );
    copyReadyRow(
      "RECOVERY SEED (single spaces between words)",
      currentWallet.seed,
      154, "times", 10
    );

    doc.setTextColor(145, 49, 38);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(
      "CONFIDENTIAL: Private keys and recovery seed grant control of this wallet. Never share this page.",
      16, 190
    );
    doc.setTextColor(80, 94, 110);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(
      "Page 1: readable printable paper wallet. Page 2: exact copy/paste values. For a one-page paper backup, print page 1 only.",
      16, 201
    );


    const short = currentWallet.address.slice(0, 8);

    doc.save(`Feelcoin-Paper-Wallet-${short}.pdf`);

  } catch (error) {
    console.error("Paper Wallet PDF generation failed.");

    alert(
      "Unable to create the paper wallet PDF. " +
      "Please verify the wallet details and try again."
    );

  } finally {
    pdfButton.disabled = false;
    pdfButton.textContent = "Download PDF";
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

/* ===== FEELCOIN ECOSYSTEM NAV ===== */
if (!document.querySelector(".ecosystem-nav-wrap")) {
  const ecosystemNav = document.createElement("div");

  ecosystemNav.className = "ecosystem-nav-wrap";

  ecosystemNav.innerHTML = `
    <a class="ecosystem-brand" href="https://feelcoin.org/" aria-label="Feelcoin home">
      <img src="/assets/feelcoin-logo-v2.png" alt="Feelcoin">
      <span><strong>Feelcoin Paper Wallet</strong><small>In Feels We Trust</small></span>
    </a>
    <nav class="ecosystem-nav" aria-label="Feelcoin ecosystem">
      <a href="https://feelcoin.org/">Website</a>
      <a href="https://pool.feelcoin.org/">Mining Pool</a>
      <a href="https://explorer.feelcoin.org/">Explorer</a>
      <a href="https://wallet.feelcoin.org/">Web Wallet</a>
    </nav>
  `;

  const app = document.getElementById("app");

  if (app) {
    app.parentNode.insertBefore(ecosystemNav, app);
  }
}
