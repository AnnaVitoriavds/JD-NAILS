const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

/* =========================================================
   SUPABASE - JD NAILS
========================================================= */

const SUPABASE_URL =
  "https://uyquqxkydlgjzijtfobn.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_uwFqiXKLtNh9J4nkRsjF6A_3cj-ZMPU";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

/* =========================================================
   CONFIGURAÇÕES
========================================================= */

let store = {
  bookings: [],
  clients: [],
  events: [],
  hours: [],
  blockedDates: [],
  media: {
    hero: null,
    about: null,
    portfolio: []
  }
};

const titles = {
  dashboard: "Visão geral",
  bookings: "Agendamentos",
  clients: "Clientes",
  hours: "Horários",
  metrics: "Métricas",
  media: "Fotos do site"
};

/* =========================================================
   LOGIN
========================================================= */

function showApp() {
  $("#loginScreen").hidden = true;
  $("#adminApp").hidden = false;

  loadAdmin();
}

function showLogin() {
  $("#loginScreen").hidden = false;
  $("#adminApp").hidden = true;
}

$("#loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const status = $("#loginStatus");

  const email = $("#loginUser").value.trim();
  const password = $("#loginPass").value;

  status.textContent = "Entrando…";

  try {
    const { data, error } =
      await db.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error("Não foi possível realizar o login.");
    }

    status.textContent = "";

    showApp();

  } catch (error) {

    console.error(error);

    if (
      error.message?.toLowerCase().includes("invalid login")
    ) {
      status.textContent = "E-mail ou senha incorretos.";
    } else {
      status.textContent =
        error.message || "Erro ao entrar.";
    }
  }
});

/* =========================================================
   LOGOUT
========================================================= */

$("#logoutBtn").addEventListener("click", async () => {

  await db.auth.signOut();

  showLogin();

});

/* =========================================================
   VERIFICAR SESSÃO
========================================================= */

async function checkSession() {

  const {
    data: { session }
  } = await db.auth.getSession();

  if (session) {
    showApp();
  } else {
    showLogin();
  }
}

db.auth.onAuthStateChange((event) => {

  if (event === "SIGNED_OUT") {
    showLogin();
  }

});

/* =========================================================
   NAVEGAÇÃO
========================================================= */

function go(tab) {

  $$(".tab").forEach((x) =>
    x.classList.remove("active")
  );

  $$(".nav-item").forEach((x) =>
    x.classList.remove("active")
  );

  $(`#tab-${tab}`)?.classList.add("active");

  $(`.nav-item[data-tab="${tab}"]`)
    ?.classList.add("active");

  $("#pageTitle").textContent =
    titles[tab] || "Painel";

  $(".sidebar")?.classList.remove("open");
}

$$(".nav-item").forEach((button) => {

  button.onclick = () =>
    go(button.dataset.tab);

});

$$("[data-go]").forEach((button) => {

  button.onclick = () =>
    go(button.dataset.go);

});

$("#mobileMenu").onclick = () => {

  $(".sidebar")
    ?.classList.toggle("open");

};

/* =========================================================
   CARREGAR DADOS
========================================================= */

async function loadAdmin() {

  try {

    await Promise.all([
      loadBookings(),
      loadClients(),
      loadEvents(),
      loadHours(),
      loadBlockedDates(),
      loadMedia()
    ]);

    renderAll();

  } catch (error) {

    console.error(
      "Erro carregando painel:",
      error
    );

  }
}

/* =========================================================
   AGENDAMENTOS
========================================================= */

async function loadBookings() {

  const { data, error } = await db
    .from("agendamentos")
    .select("*")
    .order("data", {
      ascending: false
    })
    .order("horario", {
      ascending: false
    });

  if (error) throw error;

  store.bookings = (data || []).map((b) => ({
    id: b.id,
    name: b.nome_cliente,
    phone: b.telefone,
    service: b.servico_nome,
    date: b.data,
    time: String(b.horario || "").slice(0, 5),
    duration: b.duracao_minutos,
    status: b.status,
    notes: b.observacoes,
    createdAt: b.criado_em
  }));
}

/* =========================================================
   CLIENTES
========================================================= */

async function loadClients() {

  const { data, error } = await db
    .from("clientes")
    .select("*")
    .order("criado_em", {
      ascending: false
    });

  if (error) throw error;

  /*
    O site público pode gerar um cadastro a cada novo pedido.
    No painel agrupamos pelo telefone para mostrar uma cliente
    única, preservando o cadastro mais recente.
  */

  const unique = new Map();

  (data || []).forEach((client) => {

    const key =
      digits(client.telefone) ||
      String(client.id);

    if (!unique.has(key)) {
      unique.set(key, {
        id: client.id,
        name: client.nome,
        phone: client.telefone,
        email: client.email,
        notes: client.observacoes,
        createdAt: client.criado_em
      });
    }

  });

  store.clients =
    [...unique.values()];
}


function clientBookings(client) {

  const phone =
    digits(client.phone);

  return store.bookings.filter(
    (booking) =>
      digits(booking.phone) === phone
  );
}


function clientWhatsapp(client) {

  let phone =
    digits(client.phone);

  if (!phone.startsWith("55")) {
    phone = "55" + phone;
  }

  const message =
    `Olá, ${client.name}! 💗 ` +
    `Aqui é do Studio JD Nails.`;

  return (
    `https://wa.me/${phone}` +
    `?text=${encodeURIComponent(message)}`
  );
}


function clientHtml(client) {

  const history =
    clientBookings(client);

  const last =
    history[0] || null;

  return `
    <article class="booking-card client-card">

      <div class="booking-name">

        <strong>
          ${esc(client.name)}
        </strong>

        <small>
          ${esc(client.phone)}
        </small>

        <small>
          ${history.length}
          ${history.length === 1
            ? "agendamento"
            : "agendamentos"}
        </small>

      </div>

      <div class="booking-date">

        <strong>
          ${
            last
              ? esc(last.service)
              : "Sem atendimento registrado"
          }
        </strong>

        <small>
          ${
            last
              ? `${formatDate(last.date)} às ${esc(last.time)}`
              : `Cadastro em ${formatCreated(client.createdAt)}`
          }
        </small>

      </div>

      <div class="booking-actions">

        <a
          class="wa-btn"
          href="${clientWhatsapp(client)}"
          target="_blank"
          rel="noopener"
        >
          WhatsApp
        </a>

      </div>

    </article>
  `;
}


function renderClients() {

  const search =
    ($("#clientSearch")?.value || "")
      .trim()
      .toLowerCase();

  const filtered =
    store.clients.filter((client) => {

      if (!search) return true;

      return (
        String(client.name || "")
          .toLowerCase()
          .includes(search) ||
        digits(client.phone)
          .includes(digits(search))
      );

    });

  $("#clientsList").innerHTML =
    filtered.length
      ? filtered
          .map(clientHtml)
          .join("")
      : `
        <div class="empty">
          Nenhuma cliente encontrada.
        </div>
      `;


  $("#statClients").textContent =
    store.clients.length;


  const now =
    new Date();

  const thirtyDaysAgo =
    new Date(
      now.getTime() -
      30 * 24 * 60 * 60 * 1000
    );

  $("#statNewClients").textContent =
    store.clients.filter((client) => {

      if (!client.createdAt) {
        return false;
      }

      return (
        new Date(client.createdAt) >=
        thirtyDaysAgo
      );

    }).length;
}


$("#clientSearch").oninput =
  renderClients;


/* =========================================================
   MÉTRICAS
========================================================= */

async function loadEvents() {

  const { data, error } = await db
    .from("eventos")
    .select("*")
    .order("criado_em", {
      ascending: false
    });

  if (error) throw error;

  store.events =
    data || [];
}


function renderMetrics() {

  const visits =
    store.events.filter(
      (event) =>
        event.tipo === "visita" ||
        event.tipo === "page_view" ||
        event.tipo === "pageview"
    ).length;

  const whatsapp =
    store.events.filter(
      (event) =>
        String(event.tipo || "")
          .toLowerCase()
          .includes("whatsapp")
    ).length;

  const bookings =
    store.bookings.length;

  const conversion =
    visits > 0
      ? (
          (bookings / visits) *
          100
        ).toFixed(1)
      : "0";

  $("#metricVisits").textContent =
    visits;

  $("#metricWhatsapp").textContent =
    whatsapp;

  $("#metricBookings").textContent =
    bookings;

  $("#metricConversion").textContent =
    `${conversion}%`;


  const serviceClicks = {};

  store.events
    .filter(
      (event) =>
        event.tipo ===
        "clique_agendar"
    )
    .forEach((event) => {

      const service =
        event.servico ||
        "Não informado";

      serviceClicks[service] =
        (serviceClicks[service] || 0) +
        1;

    });

  const ranking =
    Object.entries(serviceClicks)
      .sort(
        (a, b) =>
          b[1] - a[1]
      );

  $("#metricsContent").innerHTML =
    ranking.length
      ? `
        <div class="panel-head">
          <div>
            <h2>
              Serviços mais clicados
            </h2>
            <p>
              Interesse registrado no site.
            </p>
          </div>
        </div>

        ${ranking
          .map(
            ([service, total]) => `
              <article class="booking-card">
                <div class="booking-name">
                  <strong>
                    ${esc(service)}
                  </strong>
                  <small>
                    ${total}
                    ${total === 1
                      ? "clique"
                      : "cliques"}
                  </small>
                </div>
              </article>
            `
          )
          .join("")}
      `
      : `
        <div class="empty">
          As métricas aparecerão conforme
          as pessoas utilizarem o site.
        </div>
      `;
}


/* =========================================================
   FORMATADORES
========================================================= */

function formatDate(value) {

  if (!value) return "";

  const [year, month, day] =
    value.split("-");

  return `${day}/${month}/${year}`;
}

function formatCreated(value) {

  if (!value) return "";

  try {

    return new Intl.DateTimeFormat(
      "pt-BR",
      {
        dateStyle: "short",
        timeStyle: "short"
      }
    ).format(new Date(value));

  } catch {

    return value;

  }
}

function digits(value) {

  return String(value || "")
    .replace(/\D/g, "");

}

function esc(value = "") {

  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[character]
  );
}

/* =========================================================
   WHATSAPP
========================================================= */

function waFor(booking) {

  let phone = digits(booking.phone);

  if (!phone.startsWith("55")) {
    phone = "55" + phone;
  }

  const message =
    `Olá, ${booking.name}! 💗 ` +
    `Aqui é do Studio JD Nails. ` +
    `Recebemos seu pedido para ` +
    `${booking.service} em ` +
    `${formatDate(booking.date)} ` +
    `às ${booking.time}. ` +
    `Gostaria de confirmar seu horário.`;

  return (
    `https://wa.me/${phone}` +
    `?text=${encodeURIComponent(message)}`
  );
}

/* =========================================================
   HTML DO AGENDAMENTO
========================================================= */

function bookingHtml(booking) {

  return `
    <article class="booking-card">

      <div class="booking-name">

        <strong>
          ${esc(booking.name)}
        </strong>

        <small>
          ${esc(booking.service)}
          •
          ${esc(booking.phone)}
        </small>

        <small>
          ${esc(
            booking.notes ||
            "Sem observações"
          )}
        </small>

      </div>

      <div class="booking-date">

        <strong>
          ${formatDate(booking.date)}
          às
          ${esc(booking.time)}
        </strong>

        <small>
          Recebido em
          ${formatCreated(
            booking.createdAt
          )}
        </small>

        <span
          class="status ${booking.status}"
        >
          ${booking.status}
        </span>

      </div>

      <div class="booking-actions">

        <a
          class="wa-btn"
          href="${waFor(booking)}"
          target="_blank"
          rel="noopener"
        >
          WhatsApp ✓
        </a>

        <button
          class="mini-btn"
          onclick="setStatus(
            '${booking.id}',
            'confirmado'
          )"
        >
          Confirmar
        </button>

        <button
          class="mini-btn"
          onclick="setStatus(
            '${booking.id}',
            'concluido'
          )"
        >
          Concluído
        </button>

        <button
          class="mini-btn"
          onclick="setStatus(
            '${booking.id}',
            'cancelado'
          )"
        >
          Cancelar
        </button>

        <button
          class="mini-btn danger"
          onclick="deleteBooking(
            '${booking.id}'
          )"
        >
          Excluir
        </button>

      </div>

    </article>
  `;
}

/* =========================================================
   RENDERIZAR AGENDAMENTOS
========================================================= */

function renderBookings() {

  const filter =
    $("#bookingFilter").value;

  const bookings =
    filter === "all"
      ? store.bookings
      : store.bookings.filter(
          (booking) =>
            booking.status === filter
        );

  $("#bookingsList").innerHTML =
    bookings.length
      ? bookings
          .map(bookingHtml)
          .join("")
      : `
        <div class="empty">
          Nenhum agendamento
          nesta categoria.
        </div>
      `;

  $("#recentBookings").innerHTML =
    store.bookings.length
      ? store.bookings
          .slice(0, 5)
          .map(bookingHtml)
          .join("")
      : `
        <div class="empty">
          Ainda não há pedidos.
        </div>
      `;
}

$("#bookingFilter").onchange =
  renderBookings;

/* =========================================================
   ALTERAR STATUS
========================================================= */

window.setStatus =
  async function (id, status) {

    try {

      const { error } = await db
        .from("agendamentos")
        .update({
          status,
          atualizado_em:
            new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;

      const booking =
        store.bookings.find(
          (item) =>
            String(item.id) ===
            String(id)
        );

      if (booking) {
        booking.status = status;
      }

      renderAll();

    } catch (error) {

      console.error(error);

      alert(
        "Não foi possível atualizar o agendamento."
      );

    }
  };

/* =========================================================
   EXCLUIR AGENDAMENTO
========================================================= */

window.deleteBooking =
  async function (id) {

    const confirmed = confirm(
      "Deseja realmente excluir este agendamento?"
    );

    if (!confirmed) return;

    try {

      const { error } = await db
        .from("agendamentos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      store.bookings =
        store.bookings.filter(
          (item) =>
            String(item.id) !==
            String(id)
        );

      renderAll();

    } catch (error) {

      console.error(error);

      alert(
        "Não foi possível excluir."
      );

    }
  };

/* =========================================================
   ESTATÍSTICAS
========================================================= */

function renderStats() {

  const bookings =
    store.bookings;

  $("#statAll").textContent =
    bookings.length;

  $("#statPending").textContent =
    bookings.filter(
      (b) =>
        b.status === "pendente"
    ).length;

  $("#statConfirmed").textContent =
    bookings.filter(
      (b) =>
        b.status === "confirmado"
    ).length;

  /*
    Fotos ainda continuam separadas.
    Vamos conectar Storage depois.
  */

  $("#statPhotos").textContent =
    store.media.portfolio.length;
}

/* =========================================================
   HORÁRIOS
========================================================= */

async function loadHours() {

  const { data, error } = await db
    .from("horarios_funcionamento")
    .select("*")
    .order("dia_semana");

  if (error) throw error;

  store.hours = data || [];
}

function renderHours() {

  const box =
    $("#hoursEditor");

  box.innerHTML =
    store.hours
      .map((hour) => {

        const closed =
          !hour.aberto;

        return `
          <div
            class="hour-row"
            data-id="${hour.id}"
          >

            <strong>
              ${esc(hour.nome_dia)}
            </strong>

            <label>

              <input
                class="closed"
                type="checkbox"
                ${closed
                  ? "checked"
                  : ""}
              >

              Fechado

            </label>

            <input
              class="open"
              type="time"
              value="${
                hour.hora_abertura
                  ? hour.hora_abertura
                      .slice(0, 5)
                  : "09:00"
              }"
              ${closed
                ? "disabled"
                : ""}
            >

            <input
              class="close"
              type="time"
              value="${
                hour.hora_fechamento
                  ? hour.hora_fechamento
                      .slice(0, 5)
                  : "20:00"
              }"
              ${closed
                ? "disabled"
                : ""}
            >

          </div>
        `;

      })
      .join("");

  $$(".hour-row .closed")
    .forEach((checkbox) => {

      checkbox.onchange = () => {

        const row =
          checkbox.closest(
            ".hour-row"
          );

        $$(
          'input[type="time"]',
          row
        ).forEach((input) => {

          input.disabled =
            checkbox.checked;

        });
      };
    });
}

$("#saveHours").onclick =
  async () => {

    try {

      const updates = [];

      $$(".hour-row")
        .forEach((row) => {

          const id =
            Number(row.dataset.id);

          const closed =
            $(".closed", row)
              .checked;

          updates.push({
            id,
            aberto: !closed,
            hora_abertura:
              closed
                ? null
                : $(".open", row)
                    .value,
            hora_fechamento:
              closed
                ? null
                : $(".close", row)
                    .value
          });

        });

      for (const update of updates) {

        const { error } =
          await db
            .from(
              "horarios_funcionamento"
            )
            .update({
              aberto:
                update.aberto,
              hora_abertura:
                update.hora_abertura,
              hora_fechamento:
                update.hora_fechamento
            })
            .eq(
              "id",
              update.id
            );

        if (error) throw error;
      }

      await loadHours();

      renderHours();

      alert(
        "Horários salvos com sucesso!"
      );

    } catch (error) {

      console.error(error);

      alert(
        "Erro ao salvar os horários."
      );

    }
  };

/* =========================================================
   DATAS BLOQUEADAS
========================================================= */

async function loadBlockedDates() {

  const { data, error } = await db
    .from("datas_bloqueadas")
    .select("*")
    .order("data");

  if (error) throw error;

  store.blockedDates =
    data || [];
}

function renderBlocked() {

  $("#blockedDates").innerHTML =
    store.blockedDates.length
      ? store.blockedDates
          .map(
            (item) => `
              <span class="chip">

                ${formatDate(
                  item.data
                )}

                <button
                  onclick="removeBlocked(
                    '${item.id}'
                  )"
                >
                  ×
                </button>

              </span>
            `
          )
          .join("")
      : `
        <small class="empty">
          Nenhuma data extra
          bloqueada.
        </small>
      `;
}

$("#addBlocked").onclick =
  async () => {

    const date =
      $("#blockedDate").value;

    if (!date) {

      alert(
        "Escolha uma data."
      );

      return;
    }

    try {

      const { error } = await db
        .from("datas_bloqueadas")
        .insert({
          data: date,
          motivo:
            "Bloqueado pelo painel"
        });

      if (error) {

        if (
          error.code === "23505"
        ) {

          alert(
            "Essa data já está bloqueada."
          );

          return;
        }

        throw error;
      }

      $("#blockedDate").value =
        "";

      await loadBlockedDates();

      renderBlocked();

    } catch (error) {

      console.error(error);

      alert(
        "Erro ao bloquear a data."
      );

    }
  };

window.removeBlocked =
  async function (id) {

    try {

      const { error } = await db
        .from("datas_bloqueadas")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await loadBlockedDates();

      renderBlocked();

    } catch (error) {

      console.error(error);

      alert(
        "Erro ao remover a data."
      );

    }
  };

/* =========================================================
   FOTOS - SUPABASE STORAGE
========================================================= */

const MEDIA_BUCKET = "site-images";

function safeFileName(name = "") {
  return String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function mediaAreaLabel(area) {
  return ({
    portfolio: "Portfólio",
    hero: "Foto principal",
    about: "Seção Sobre"
  })[area] || area;
}

async function loadMedia() {
  const areas = ["portfolio", "hero", "about"];
  const loaded = { hero: null, about: null, portfolio: [] };

  for (const area of areas) {
    const { data, error } = await db.storage
      .from(MEDIA_BUCKET)
      .list(area, {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" }
      });

    if (error) throw error;

    const items = (data || [])
      .filter(item => item.name)
      .map(item => {
        const path = `${area}/${item.name}`;
        const { data: publicData } = db.storage
          .from(MEDIA_BUCKET)
          .getPublicUrl(path);

        return {
          name: item.name,
          path,
          area,
          url: publicData.publicUrl,
          createdAt: item.created_at || item.updated_at || null
        };
      });

    if (area === "portfolio") {
      loaded.portfolio = items;
    } else {
      loaded[area] = items[0] || null;
    }
  }

  store.media = loaded;
}

function mediaCard(item) {
  return `
    <article class="media-card" style="border:1px solid #eadde2;border-radius:18px;overflow:hidden;background:#fff;">
      <img
        src="${esc(item.url)}"
        alt="${esc(mediaAreaLabel(item.area))}"
        style="width:100%;aspect-ratio:1/1;object-fit:cover;display:block;"
      >
      <div style="padding:14px;display:grid;gap:8px;">
        <strong>${esc(mediaAreaLabel(item.area))}</strong>
        <small>${esc(item.name)}</small>
        <button
          class="mini-btn danger"
          type="button"
          onclick="deleteMedia('${encodeURIComponent(item.path)}')"
        >
          Excluir imagem
        </button>
      </div>
    </article>
  `;
}

function renderMedia() {
  const all = [
    ...(store.media.hero ? [store.media.hero] : []),
    ...(store.media.about ? [store.media.about] : []),
    ...store.media.portfolio
  ];

  $("#mediaGrid").innerHTML = all.length
    ? all.map(mediaCard).join("")
    : `<div class="empty">Nenhuma imagem enviada pelo painel ainda.</div>`;

  $("#statPhotos").textContent = store.media.portfolio.length;
}

$("#mediaFile").onchange = (e) => {
  $("#fileName").textContent =
    e.target.files[0]?.name || "Nenhum arquivo escolhido";
};

$("#mediaForm").onsubmit = async (e) => {
  e.preventDefault();

  const status = $("#mediaStatus");
  const file = $("#mediaFile").files[0];
  const area = $("#mediaArea").value;
  const title = $("#mediaTitle").value.trim();
  const category = $("#mediaCategory").value.trim();

  if (!file) {
    status.textContent = "Escolha uma imagem.";
    return;
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    status.textContent = "Use uma imagem JPG, PNG ou WEBP.";
    return;
  }

  if (file.size > 8 * 1024 * 1024) {
    status.textContent = "A imagem deve ter no máximo 8 MB.";
    return;
  }

  status.textContent = "Enviando imagem…";

  try {
    if (area === "hero" || area === "about") {
      const { data: oldFiles, error: listError } = await db.storage
        .from(MEDIA_BUCKET)
        .list(area, { limit: 100 });

      if (listError) throw listError;

      const oldPaths = (oldFiles || [])
        .filter(item => item.name)
        .map(item => `${area}/${item.name}`);

      if (oldPaths.length) {
        const { error: removeError } = await db.storage
          .from(MEDIA_BUCKET)
          .remove(oldPaths);

        if (removeError) throw removeError;
      }
    }

    const extension = file.name.includes(".")
      ? file.name.split(".").pop().toLowerCase()
      : "jpg";

    const base = safeFileName(
      title || category || file.name.replace(/\.[^.]+$/, "")
    ) || "imagem";

    const path = `${area}/${Date.now()}-${base}.${extension}`;

    const { error: uploadError } = await db.storage
      .from(MEDIA_BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type
      });

    if (uploadError) throw uploadError;

    await loadMedia();
    renderMedia();

    $("#mediaForm").reset();
    $("#fileName").textContent = "Nenhum arquivo escolhido";
    status.textContent = "Imagem adicionada com sucesso!";

    setTimeout(() => {
      status.textContent = "";
    }, 3500);

  } catch (error) {
    console.error("Erro no upload:", error);
    status.textContent =
      error.message || "Não foi possível enviar a imagem.";
  }
};

window.deleteMedia = async function (encodedPath) {
  const path = decodeURIComponent(encodedPath);

  const confirmed = confirm("Deseja realmente excluir esta imagem?");
  if (!confirmed) return;

  try {
    const { error } = await db.storage
      .from(MEDIA_BUCKET)
      .remove([path]);

    if (error) throw error;

    await loadMedia();
    renderMedia();

  } catch (error) {
    console.error("Erro ao excluir imagem:", error);
    alert("Não foi possível excluir a imagem.");
  }
};


/* =========================================================
   RENDERIZAÇÃO
========================================================= */

function renderAll() {

  renderStats();

  renderBookings();

  renderClients();

  renderMetrics();

  renderHours();

  renderBlocked();

  renderMedia();
}

/* =========================================================
   INICIAR
========================================================= */

checkSession();