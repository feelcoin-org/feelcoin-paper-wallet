import "./style.css";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";

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
        src="/feelcoin-logo-optimized.webp"
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
      src="/feelcoin-logo-optimized.webp"
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


    async function loadImage(url, mime = "image/png", quality = 0.95) {

      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = url;
      });

      let w = img.naturalWidth;
      let h = img.naturalHeight;

      if (w > 4000) {
        const scale = 4000 / w;
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");

      ctx.drawImage(img, 0, 0, w, h);

      return {
        data: canvas.toDataURL(mime, quality),
        width: w,
        height: h
      };
    }


    function coverImage(image, x, y, w, h, format = "JPEG") {

      const ir = image.width / image.height;
      const br = w / h;

      let dw, dh, dx, dy;

      if (ir > br) {
        dh = h;
        dw = h * ir;
        dx = x - (dw - w) / 2;
        dy = y;
      } else {
        dw = w;
        dh = w / ir;
        dx = x;
        dy = y - (dh - h) / 2;
      }

      doc.addImage(
        image.data,
        format,
        dx,
        dy,
        dw,
        dh,
        undefined,
        "FAST"
      );
    }


    const community = await loadImage(
      "/assets/feelcoin-community.webp",
      "image/jpeg",
      0.92
    );

    const banknote = await loadImage(
      "/assets/feelcoin-banknote-big.png",
      "image/png"
    );

    const coin = await loadImage(
      "/assets/feelcoin-coin.webp",
      "image/png"
    );


    /* =====================================================
       FULL PAGE BACKGROUND
       ===================================================== */

    /*
     * COMMUNITY BACKGROUND
     * Show the entire artwork instead of heavily cropping it.
     */

    /*
     * COMMUNITY BACKGROUND
     * Fill the page with a subtle enlarged copy first,
     * then place the full zoomed-out artwork on top.
     */

    doc.setFillColor(4, 11, 18);
    doc.rect(0, 0, W, H, "F");

    /* soft full-page artwork behind the main image */
    const coverScale =
      Math.max(
        W / community.width,
        H / community.height
      );

    const coverW =
      community.width * coverScale;

    const coverH =
      community.height * coverScale;

    const coverX =
      (W - coverW) / 2;

    const coverY =
      (H - coverH) / 2;

    doc.setGState(
      new doc.GState({
        opacity: 0.42
      })
    );

    doc.addImage(
      community.data,
      "JPEG",
      coverX,
      coverY,
      coverW,
      coverH,
      undefined,
      "FAST"
    );

    doc.setGState(
      new doc.GState({
        opacity: 1
      })
    );

    /* main artwork: still zoomed out so most of it stays visible */
    const communityScale =
      Math.min(
        (W - 8) / community.width,
        (H - 8) / community.height
      );

    const communityW =
      community.width * communityScale;

    const communityH =
      community.height * communityScale;

    const communityX =
      (W - communityW) / 2;

    const communityY =
      (H - communityH) / 2;

    doc.addImage(
      community.data,
      "JPEG",
      communityX,
      communityY,
      communityW,
      communityH,
      undefined,
      "FAST"
    );

    doc.setGState(
      new doc.GState({
        opacity: 0.48
      })
    );

    doc.setFillColor(4, 11, 18);

    doc.rect(
      0,
      0,
      W,
      H,
      "F"
    );

    doc.setGState(
      new doc.GState({
        opacity: 1
      })
    );


    /* =====================================================
       HEADER
       ===================================================== */

    doc.addImage(
      coin.data,
      "PNG",
      14,
      12,
      25,
      25
    );

    doc.setTextColor(
      238,
      207,
      143
    );

    doc.setFont(
      "times",
      "bold"
    );

    doc.setFontSize(25);

    doc.text(
      "FEELCOIN",
      46,
      23
    );

    doc.setFontSize(11);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "OFFICIAL PAPER WALLET",
      46,
      31
    );

    doc.setFont(
      "times",
      "italic"
    );

    doc.setFontSize(9);

    doc.text(
      "In Feels We Trust",
      196,
      23,
      {
        align: "right"
      }
    );


    /* serial */

    const serial =
      "FC-" +
      currentWallet.address
        .slice(1, 13)
        .toUpperCase()
        .match(/.{1,4}/g)
        .join("-");

    doc.setFont(
      "courier",
      "bold"
    );

    doc.setFontSize(7);

    doc.text(
      serial,
      196,
      31,
      {
        align: "right"
      }
    );


    /* thin separator */

    doc.setDrawColor(
      194,
      151,
      73
    );

    doc.setLineWidth(0.4);

    doc.line(
      14,
      42,
      196,
      42
    );


    /* =====================================================
       MAIN BANKNOTE
       ===================================================== */

    const noteX = 15;
    const noteY = 49;
    const noteW = 180;

    const noteH =
      noteW *
      banknote.height /
      banknote.width;


    /*
     * Create a genuinely transparent version of the ORIGINAL
     * banknote artwork.
     *
     * No recoloring.
     * No cream wash.
     * No crop.
     */

    const originalBanknoteImage =
      await new Promise((resolve, reject) => {

        const img = new Image();

        img.onload = () => resolve(img);
        img.onerror = reject;

        img.src =
          "/assets/feelcoin-banknote-big.png";
      });


    const fadedCanvas =
      document.createElement("canvas");

    fadedCanvas.width =
      originalBanknoteImage.naturalWidth;

    fadedCanvas.height =
      originalBanknoteImage.naturalHeight;


    const fadedCtx =
      fadedCanvas.getContext("2d");


    fadedCtx.clearRect(
      0,
      0,
      fadedCanvas.width,
      fadedCanvas.height
    );


    /*
     * Only transparency is changed.
     * Increase 0.52 if you want the banknote stronger.
     */
    fadedCtx.globalAlpha = 0.52;

    fadedCtx.drawImage(
      originalBanknoteImage,
      0,
      0
    );


    fadedCtx.globalAlpha = 1;


    const fadedBanknote =
      fadedCanvas.toDataURL(
        "image/png"
      );


    doc.addImage(
      fadedBanknote,
      "PNG",
      noteX,
      noteY,
      noteW,
      noteH,
      undefined,
      "FAST"
    );


    doc.setDrawColor(
      205,
      166,
      92
    );

    doc.setLineWidth(0.55);

    doc.roundedRect(
      noteX,
      noteY,
      noteW,
      noteH,
      2,
      2
    );


    /* =====================================================
       PUBLIC WALLET AREA ON BANKNOTE
       ===================================================== */

    const publicY =
      noteY +
      noteH -
      35;

    doc.setGState(
      new doc.GState({
        opacity: 0.84
      })
    );

    doc.setFillColor(
      249,
      239,
      215
    );

    doc.roundedRect(
      21,
      publicY,
      122,
      27,
      2,
      2,
      "F"
    );

    doc.setGState(
      new doc.GState({
        opacity: 1
      })
    );

    doc.setTextColor(
      105,
      73,
      28
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(6.7);

    doc.text(
      "PUBLIC FEELCOIN ADDRESS",
      26,
      publicY + 7
    );

    doc.setTextColor(
      18,
      34,
      48
    );

    doc.setFont(
      "courier",
      "bold"
    );

    doc.setFontSize(7);

    const addressLines =
      doc.splitTextToSize(
        currentWallet.address,
        110
      );

    doc.text(
      addressLines,
      26,
      publicY + 14
    );


    /* =====================================================
       QR CODE
       ===================================================== */

    const qr = await QRCode.toDataURL(
      currentWallet.address,
      {
        width: 1000,
        margin: 1,
        errorCorrectionLevel: "M"
      }
    );

    doc.setFillColor(
      255,
      255,
      255
    );

    doc.roundedRect(
      151,
      publicY - 3,
      36,
      36,
      2,
      2,
      "F"
    );

    doc.addImage(
      qr,
      "PNG",
      154,
      publicY,
      30,
      30
    );


    /* =====================================================
       PRIVATE SECTION
       ===================================================== */

    const panelY =
      noteY +
      noteH +
      10;

    const panelH = 102;


    doc.setGState(
      new doc.GState({
        opacity: 0.92
      })
    );

    doc.setFillColor(
      248,
      238,
      213
    );

    doc.roundedRect(
      15,
      panelY,
      180,
      panelH,
      3,
      3,
      "F"
    );

    doc.setGState(
      new doc.GState({
        opacity: 1
      })
    );


    doc.setDrawColor(
      177,
      132,
      55
    );

    doc.setLineWidth(0.45);

    doc.roundedRect(
      15,
      panelY,
      180,
      panelH,
      3,
      3
    );


    /* Private title */

    doc.setFillColor(
      13,
      29,
      44
    );

    doc.roundedRect(
      20,
      panelY + 6,
      66,
      12,
      2,
      2,
      "F"
    );

    doc.setTextColor(
      237,
      204,
      136
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(8);

    doc.text(
      "PRIVATE RECOVERY DATA",
      53,
      panelY + 14,
      {
        align: "center"
      }
    );


    /* warning */

    doc.setTextColor(
      119,
      74,
      43
    );

    doc.setFontSize(6.5);

    doc.text(
      "KEEP OFFLINE • NEVER SHARE • STORE SECURELY",
      189,
      panelY + 14,
      {
        align: "right"
      }
    );


    /* =====================================================
       SEED
       ===================================================== */

    doc.setTextColor(
      108,
      75,
      29
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(7);

    doc.text(
      "RECOVERY SEED",
      22,
      panelY + 29
    );

    doc.setTextColor(
      19,
      34,
      50
    );

    doc.setFont(
      "times",
      "bold"
    );

    doc.setFontSize(8.2);

    const seedLines =
      doc.splitTextToSize(
        currentWallet.seed,
        164
      );

    doc.text(
      seedLines,
      22,
      panelY + 38
    );


    /* separator */

    doc.setDrawColor(
      187,
      148,
      79
    );

    doc.setLineWidth(0.25);

    doc.line(
      22,
      panelY + 59,
      188,
      panelY + 59
    );


    /* =====================================================
       PRIVATE SPEND KEY
       ===================================================== */

    doc.setTextColor(
      108,
      75,
      29
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(6.6);

    doc.text(
      "PRIVATE SPEND KEY",
      22,
      panelY + 69
    );

    doc.setTextColor(
      19,
      34,
      50
    );

    doc.setFont(
      "courier",
      "normal"
    );

    doc.setFontSize(6.3);

    const spendLines =
      doc.splitTextToSize(
        currentWallet.spendKey,
        75
      );

    doc.text(
      spendLines,
      22,
      panelY + 77
    );


    /* =====================================================
       PRIVATE VIEW KEY
       ===================================================== */

    doc.setTextColor(
      108,
      75,
      29
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(6.6);

    doc.text(
      "PRIVATE VIEW KEY",
      110,
      panelY + 69
    );

    doc.setTextColor(
      19,
      34,
      50
    );

    doc.setFont(
      "courier",
      "normal"
    );

    doc.setFontSize(6.3);

    const viewLines =
      doc.splitTextToSize(
        currentWallet.viewKey,
        75
      );

    doc.text(
      viewLines,
      110,
      panelY + 77
    );


    /* =====================================================
       FOOTER
       ===================================================== */

    doc.setDrawColor(
      194,
      151,
      73
    );

    doc.line(
      14,
      277,
      196,
      277
    );

    doc.setTextColor(
      224,
      192,
      128
    );

    doc.setFont(
      "times",
      "italic"
    );

    doc.setFontSize(8);

    doc.text(
      "Feelcoin • In Feels We Trust",
      14,
      285
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(5.6);

    doc.text(
      "Anyone with the recovery seed or private spend key can control this wallet.",
      196,
      285,
      {
        align: "right"
      }
    );


    const short =
      currentWallet.address.slice(0, 8);

    doc.save(
      `Feelcoin-Paper-Wallet-${short}.pdf`
    );

  } catch (error) {

    console.error(error);

    alert(
      "Unable to create PDF:\n\n" +
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

/* ===== FEELCOIN ECOSYSTEM NAV ===== */
if (!document.querySelector(".ecosystem-nav-wrap")) {
  const ecosystemNav = document.createElement("div");

  ecosystemNav.className = "ecosystem-nav-wrap";

  ecosystemNav.innerHTML = `
    <a class="ecosystem-brand" href="https://feelcoin.org/" aria-label="Feelcoin home">
      <img src="/assets/feelcoin-coin.webp" alt="Feelcoin">
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
