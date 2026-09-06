/* =========================================================
   STUDIO JD NAILS
   SCRIPT PRINCIPAL
========================================================= */

const $ = (selector, scope = document) =>
  scope.querySelector(selector);

const $$ = (selector, scope = document) =>
  [...scope.querySelectorAll(selector)];


/* =========================================================
   HEADER / MENU / SCROLL
========================================================= */

const header = $('.site-header');
const navToggle = $('#navToggle');
const mainNav = $('#mainNav');
const progress = $('#pageProgress');

function handleScroll() {

  const y = window.scrollY;

  header?.classList.toggle(
    'scrolled',
    y > 30
  );

  const max =
    document.documentElement.scrollHeight -
    window.innerHeight;

  const percent =
    max > 0
      ? (y / max) * 100
      : 0;

  if (progress) {
    progress.style.width =
      `${Math.min(100, percent)}%`;
  }
}

window.addEventListener(
  'scroll',
  handleScroll,
  { passive: true }
);

handleScroll();


/* =========================================================
   MENU MOBILE
========================================================= */

navToggle?.addEventListener(
  'click',
  () => {

    const open =
      mainNav?.classList.toggle('open');

    navToggle.setAttribute(
      'aria-expanded',
      String(open)
    );
  }
);


$$('.main-nav a').forEach(link => {

  link.addEventListener(
    'click',
    () => {

      mainNav?.classList.remove('open');

      navToggle?.setAttribute(
        'aria-expanded',
        'false'
      );
    }
  );

});


/* =========================================================
   ANIMAÇÃO REVEAL
========================================================= */

if ('IntersectionObserver' in window) {

  const revealObserver =
    new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (
            entry.isIntersecting
          ) {

            entry.target
              .classList
              .add('visible');

            revealObserver
              .unobserve(
                entry.target
              );
          }

        });

      },
      {
        threshold: 0.12,
        rootMargin:
          '0px 0px -30px 0px'
      }
    );


  $$('.reveal').forEach(el => {
    revealObserver.observe(el);
  });

} else {

  $$('.reveal').forEach(el => {
    el.classList.add('visible');
  });

}


/* =========================================================
   MENU ATIVO POR SEÇÃO
========================================================= */

const sections =
  $$('main section[id]');

const navLinks =
  $$('.main-nav a[href^="#"]');


if ('IntersectionObserver' in window) {

  const sectionObserver =
    new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (
            !entry.isIntersecting
          ) {
            return;
          }

          const id =
            entry.target.id;

          navLinks.forEach(link => {

            link.classList.toggle(
              'active',
              link.getAttribute(
                'href'
              ) === `#${id}`
            );

          });

        });

      },
      {
        rootMargin:
          '-35% 0px -55% 0px',
        threshold: 0
      }
    );


  sections.forEach(section => {
    sectionObserver.observe(
      section
    );
  });

}


/* =========================================================
   CONTADORES
========================================================= */

function animateCounter(el) {

  const target =
    Number(
      el.dataset.counter || 0
    );

  const decimals =
    Number(
      el.dataset.decimals || 0
    );

  const duration = 1200;

  const start =
    performance.now();


  function frame(now) {

    const progress =
      Math.min(
        1,
        (now - start) /
          duration
      );

    const eased =
      1 -
      Math.pow(
        1 - progress,
        3
      );

    const value =
      target * eased;


    el.textContent =
      value.toLocaleString(
        'pt-BR',
        {
          minimumFractionDigits:
            decimals,

          maximumFractionDigits:
            decimals
        }
      );


    if (
      progress < 1
    ) {

      requestAnimationFrame(
        frame
      );

    }
  }


  requestAnimationFrame(
    frame
  );
}


if ('IntersectionObserver' in window) {

  const counterObserver =
    new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (
            entry.isIntersecting
          ) {

            animateCounter(
              entry.target
            );

            counterObserver
              .unobserve(
                entry.target
              );
          }

        });

      },
      {
        threshold: 0.55
      }
    );


  $$('[data-counter]')
    .forEach(el => {

      counterObserver.observe(el);

    });

}


/* =========================================================
   FILTRO DOS SERVIÇOS
========================================================= */

const filterButtons =
  $$('.filter-btn');

const serviceCards =
  $$('.service-card');


filterButtons.forEach(button => {

  button.addEventListener(
    'click',
    () => {

      const filter =
        button.dataset.filter;


      filterButtons
        .forEach(btn => {

          btn.classList
            .remove('active');

        });


      button.classList
        .add('active');


      serviceCards
        .forEach(card => {

          const matches =
            filter === 'all' ||
            card.dataset.category ===
              filter;


          card.classList.toggle(
            'is-hidden',
            !matches
          );

        });

    }
  );

});


/* =========================================================
   BOTÕES "AGENDAR ESTE SERVIÇO"
========================================================= */

const serviceSelect =
  $('#service');


$$('.service-book')
  .forEach(button => {

    button.addEventListener(
      'click',
      () => {

        if (
          serviceSelect
        ) {

          serviceSelect.value =
            button.dataset.service ||
            '';

        }


        $('#agendamento')
          ?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });


        setTimeout(
          () => {

            serviceSelect?.focus();

          },
          500
        );

      }
    );

  });


/* =========================================================
   FAQ
========================================================= */

$$('.faq-item button')
  .forEach(button => {

    button.addEventListener(
      'click',
      () => {

        const item =
          button.closest(
            '.faq-item'
          );


        if (!item) {
          return;
        }


        const isOpen =
          item.classList
            .contains('open');


        $$('.faq-item')
          .forEach(other => {

            other.classList
              .remove('open');


            const otherButton =
              $('button', other);


            if (
              otherButton
            ) {

              otherButton
                .setAttribute(
                  'aria-expanded',
                  'false'
                );


              const icon =
                $('b', otherButton);


              if (icon) {
                icon.textContent =
                  '+';
              }
            }

          });


        if (!isOpen) {

          item.classList
            .add('open');


          button.setAttribute(
            'aria-expanded',
            'true'
          );


          const icon =
            $('b', button);


          if (icon) {
            icon.textContent =
              '−';
          }

        }

      }
    );

  });


/* =========================================================
   ELEMENTOS DO AGENDAMENTO
========================================================= */

const dateInput =
  $('#date');

const timeInput =
  $('#time');

const bookingForm =
  $('#bookingForm');

const phoneInput =
  $('#phone');

let publicConfig = null;


/* =========================================================
   CONFIGURAÇÃO PADRÃO
========================================================= */

function localFallbackConfig() {

  return {

    settings: {

      whatsapp:
        '5561981735176',

      hours: {

        0: {
          label:
            'Domingo',

          closed: true,

          open: '',

          close: ''
        },


        1: {
          label:
            'Segunda-feira',

          closed: false,

          open:
            '09:00',

          close:
            '20:00'
        },


        2: {
          label:
            'Terça-feira',

          closed: false,

          open:
            '09:00',

          close:
            '20:00'
        },


        3: {
          label:
            'Quarta-feira',

          closed: false,

          open:
            '09:00',

          close:
            '20:00'
        },


        4: {
          label:
            'Quinta-feira',

          closed: false,

          open:
            '09:00',

          close:
            '20:00'
        },


        5: {
          label:
            'Sexta-feira',

          closed: false,

          open:
            '09:00',

          close:
            '20:00'
        },


        6: {
          label:
            'Sábado',

          closed: false,

          open:
            '09:00',

          close:
            '15:00'
        }

      },

      holidaysClosed:
        true,

      blockedDates: []

    },


    media: {

      hero: '',

      about: '',

      portfolio: []

    }

  };

}


/* =========================================================
   CARREGAR CONFIGURAÇÃO
========================================================= */

async function loadPublicConfig() {

  try {

    const response =
      await fetch(
        '/api/public',
        {
          cache:
            'no-store'
        }
      );


    if (
      !response.ok
    ) {

      throw new Error(
        'API indisponível'
      );

    }


    publicConfig =
      await response.json();


  } catch (error) {

    console.warn(
      'Usando configuração local.',
      error
    );


    try {

      const saved =
        JSON.parse(
          localStorage.getItem(
            'jd_public_config'
          ) || 'null'
        );


      publicConfig =
        saved ||
        localFallbackConfig();


    } catch {

      publicConfig =
        localFallbackConfig();

    }

  }


  /*
    GARANTE QUE SEMPRE
    EXISTA CONFIGURAÇÃO.
  */

  if (
    !publicConfig ||
    !publicConfig.settings
  ) {

    publicConfig =
      localFallbackConfig();

  }


  try {

    localStorage.setItem(
      'jd_public_config',
      JSON.stringify(
        publicConfig
      )
    );

  } catch {}


  renderHours();

  renderMedia();

  populateAvailableDates();

}


/* =========================================================
   HORÁRIOS EXIBIDOS NO SITE
========================================================= */

function renderHours() {

  const fallback =
    localFallbackConfig();


  const hours =
    publicConfig
      ?.settings
      ?.hours ||
    fallback.settings.hours;


  const box =
    $('#bookingHours');


  /*
    ORDEM CORRETA:
    SEGUNDA
    TERÇA
    QUARTA
    QUINTA
    SEXTA
    SÁBADO
    DOMINGO
  */

  const order =
    [1, 2, 3, 4, 5, 6, 0];


  if (box) {

    box.innerHTML =
      order
        .filter(
          day => hours[day]
        )
        .map(day => {

          const h =
            hours[day];


          return `
            <div class="hours-row">

              <b>
                ${h.label}
              </b>

              <span>
                ${
                  h.closed
                    ? 'Fechado'
                    : `${h.open} às ${h.close}`
                }
              </span>

            </div>
          `;

        })
        .join('');

  }


  const locationHours =
    $('#locationHours');


  if (
    locationHours
  ) {

    locationHours.textContent =
      'Seg. a sex. 09h–20h • Sáb. 09h–15h • Dom. e feriados fechado';

  }

}


/* =========================================================
   FOTOS / MÍDIA
========================================================= */

function renderMedia() {

  const media =
    publicConfig?.media || {};


  if (
    media.hero &&
    $('#heroImage')
  ) {

    $('#heroImage').src =
      media.hero;

  }


  if (
    media.about &&
    $('#aboutImage')
  ) {

    $('#aboutImage').src =
      media.about;

  }


  /*
    Não substitui o portfólio
    do HTML se não houver fotos
    configuradas pelo painel.
  */

  const grid =
    $('#portfolioGrid');


  if (
    grid &&
    Array.isArray(
      media.portfolio
    ) &&
    media.portfolio.length
  ) {

    grid.innerHTML =
      media.portfolio
        .map(
          item => `

            <article
              class="portfolio-item dynamic-photo reveal visible"
            >

              <img
                src="${escapeHtml(item.src)}"
                alt="${escapeHtml(
                  item.title ||
                  'Trabalho JD Nails'
                )}"
              >

              <div
                class="portfolio-caption"
              >

                <strong>
                  ${escapeHtml(
                    item.title ||
                    'Trabalho JD Nails'
                  )}
                </strong>

                <span>
                  ${escapeHtml(
                    item.category ||
                    'Portfólio'
                  )}
                </span>

              </div>

            </article>

          `
        )
        .join('');

  }

}


function escapeHtml(
  value = ''
) {

  return String(value)
    .replace(
      /[&<>'"]/g,
      char => ({

        '&': '&amp;',

        '<': '&lt;',

        '>': '&gt;',

        "'": '&#39;',

        '"': '&quot;'

      }[char])
    );

}


/* =========================================================
   FUNÇÕES INTERNAS DE DATA

   A DATA EXISTE INTERNAMENTE
   APENAS PARA CONTROLAR OS HORÁRIOS.

   O CLIENTE NÃO VÊ A DATA.
========================================================= */

function parseDateLocal(
  value
) {

  const [
    year,
    month,
    day
  ] =
    String(
      value || ''
    )
      .split('-')
      .map(Number);


  return new Date(
    year,
    month - 1,
    day
  );

}


function dateKey(date) {

  const year =
    date.getFullYear();


  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      '0'
    );


  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      '0'
    );


  return (
    `${year}-${month}-${day}`
  );

}


function selectedDay() {

  if (
    !dateInput?.value
  ) {

    return null;

  }


  return parseDateLocal(
    dateInput.value
  ).getDay();

}


/* =========================================================
   FERIADOS NACIONAIS
========================================================= */

function isBrazilNationalHoliday(
  value
) {

  if (
    publicConfig
      ?.settings
      ?.holidaysClosed ===
    false
  ) {

    return false;

  }


  const date =
    parseDateLocal(
      value
    );


  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      '0'
    );


  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      '0'
    );


  const mmdd =
    `${month}-${day}`;


  const holidays =
    new Set([

      '01-01',

      '04-21',

      '05-01',

      '09-07',

      '10-12',

      '11-02',

      '11-15',

      '11-20',

      '12-25'

    ]);


  return holidays.has(
    mmdd
  );

}


/* =========================================================
   VERIFICAR SE O DIA ESTÁ DISPONÍVEL
========================================================= */

function isSelectableDate(
  value
) {

  if (!value) {
    return false;
  }


  const fallback =
    localFallbackConfig();


  const settings =
    publicConfig?.settings ||
    fallback.settings;


  const blockedDates =
    settings.blockedDates ||
    [];


  if (
    blockedDates.includes(
      value
    )
  ) {

    return false;

  }


  if (
    isBrazilNationalHoliday(
      value
    )
  ) {

    return false;

  }


  const day =
    parseDateLocal(
      value
    ).getDay();


  const hours =
    settings.hours ||
    fallback.settings.hours;


  const schedule =
    hours[day];


  if (
    !schedule
  ) {

    return false;

  }


  if (
    schedule.closed
  ) {

    return false;

  }


  if (
    !schedule.open ||
    !schedule.close
  ) {

    return false;

  }


  return true;

}


/* =========================================================
   MOSTRAR SOMENTE O DIA DA SEMANA
========================================================= */

function prettyDate(
  value
) {

  const date =
    parseDateLocal(
      value
    );


  const text =
    new Intl.DateTimeFormat(
      'pt-BR',
      {
        weekday:
          'long'
      }
    ).format(
      date
    );


  return (
    text.charAt(0)
      .toUpperCase() +
    text.slice(1)
  );

}


/* =========================================================
   ENCONTRAR A PRÓXIMA DATA
   DE CADA DIA DA SEMANA
========================================================= */

function getNextWeekdayDate(
  dayNumber
) {

  const today =
    new Date();


  today.setHours(
    0,
    0,
    0,
    0
  );


  /*
    PROCURA ATÉ 8 SEMANAS
    PARA FRENTE.
  */

  for (
    let offset = 0;
    offset < 56;
    offset++
  ) {

    const date =
      new Date(
        today
      );


    date.setDate(
      today.getDate() +
      offset
    );


    if (
      date.getDay() !==
      dayNumber
    ) {

      continue;

    }


    const value =
      dateKey(
        date
      );


    if (
      isSelectableDate(
        value
      )
    ) {

      return value;

    }

  }


  return null;

}


/* =========================================================
   PREENCHER DIAS DISPONÍVEIS

   SEMPRE NESTA ORDEM:

   SEGUNDA-FEIRA
   TERÇA-FEIRA
   QUARTA-FEIRA
   QUINTA-FEIRA
   SEXTA-FEIRA
   SÁBADO
========================================================= */

function populateAvailableDates() {

  if (!dateInput) {
    return;
  }


  dateInput.innerHTML =
    `
      <option value="">
        Selecione um dia disponível
      </option>
    `;


  const weekDays = [

    {
      number: 1,
      label:
        'Segunda-feira'
    },

    {
      number: 2,
      label:
        'Terça-feira'
    },

    {
      number: 3,
      label:
        'Quarta-feira'
    },

    {
      number: 4,
      label:
        'Quinta-feira'
    },

    {
      number: 5,
      label:
        'Sexta-feira'
    },

    {
      number: 6,
      label:
        'Sábado'
    }

  ];


  let added = 0;


  weekDays.forEach(
    weekDay => {

      const internalDate =
        getNextWeekdayDate(
          weekDay.number
        );


      if (
        !internalDate
      ) {

        return;

      }


      const option =
        document.createElement(
          'option'
        );


      /*
        DATA REAL FICA
        ESCONDIDA NO VALUE.
      */

      option.value =
        internalDate;


      /*
        CLIENTE VÊ SOMENTE
        O DIA DA SEMANA.
      */

      option.textContent =
        weekDay.label;


      dateInput.appendChild(
        option
      );


      added++;

    }
  );


  if (
    added === 0
  ) {

    dateInput.innerHTML =
      `
        <option value="">
          Nenhum dia disponível
        </option>
      `;


    dateInput.disabled =
      true;


  } else {

    dateInput.disabled =
      false;

  }


  resetTimeOptions();

}


/* =========================================================
   RESETAR HORÁRIOS
========================================================= */

function resetTimeOptions(
  message =
    'Escolha primeiro o dia'
) {

  if (!timeInput) {
    return;
  }


  timeInput.innerHTML =
    `
      <option value="">
        ${message}
      </option>
    `;


  timeInput.disabled =
    true;

}


/* =========================================================
   CONVERTER HORÁRIO
========================================================= */

function toMinutes(
  value
) {

  const [
    hour,
    minute
  ] =
    String(
      value || '00:00'
    )
      .split(':')
      .map(Number);


  return (
    hour * 60 +
    minute
  );

}


function fromMinutes(
  total
) {

  const hour =
    String(
      Math.floor(
        total / 60
      )
    ).padStart(
      2,
      '0'
    );


  const minute =
    String(
      total % 60
    ).padStart(
      2,
      '0'
    );


  return (
    `${hour}:${minute}`
  );

}


/* =========================================================
   GERAR HORÁRIOS DE 30 EM 30 MINUTOS
========================================================= */

function generateTimeSlots(
  open,
  close
) {

  const slots = [];


  const start =
    toMinutes(
      open
    );


  const end =
    toMinutes(
      close
    );


  for (
    let minutes = start;
    minutes < end;
    minutes += 30
  ) {

    slots.push(
      fromMinutes(
        minutes
      )
    );

  }


  return slots;

}


/* =========================================================
   IMPEDIR HORÁRIOS QUE JÁ PASSARAM
========================================================= */

function isPastSlot(
  dateValue,
  timeValue
) {

  const date =
    parseDateLocal(
      dateValue
    );


  const [
    hour,
    minute
  ] =
    timeValue
      .split(':')
      .map(Number);


  date.setHours(
    hour,
    minute,
    0,
    0
  );


  return (
    date.getTime() <=
    Date.now()
  );

}


/* =========================================================
   BUSCAR HORÁRIOS JÁ RESERVADOS

   SE NÃO HOUVER API,
   USA O LOCALSTORAGE.
========================================================= */

async function getBookedTimes(
  date
) {

  try {

    const response =
      await fetch(
        `/api/availability?date=${encodeURIComponent(date)}`,
        {
          cache:
            'no-store'
        }
      );


    if (
      !response.ok
    ) {

      throw new Error(
        'API indisponível'
      );

    }


    const data =
      await response.json();


    return Array.isArray(
      data.bookedTimes
    )
      ? data.bookedTimes
      : [];


  } catch {


    try {

      const local =
        JSON.parse(
          localStorage.getItem(
            'jd_bookings_fallback'
          ) || '[]'
        );


      return local
        .filter(
          booking =>
            booking.date ===
              date &&
            booking.status !==
              'cancelado'
        )
        .map(
          booking =>
            booking.time
        );


    } catch {

      return [];

    }

  }

}


/* =========================================================
   CARREGAR HORÁRIOS DISPONÍVEIS
========================================================= */

async function refreshTimeOptions() {

  const help =
    $('#dateHelp');


  if (
    !dateInput?.value
  ) {

    resetTimeOptions();


    if (help) {

      help.textContent =
        'Selecione um dia da semana para ver os horários livres.';

    }


    return;

  }


  if (
    !isSelectableDate(
      dateInput.value
    )
  ) {

    resetTimeOptions(
      'Dia indisponível'
    );


    if (help) {

      help.textContent =
        'Este dia está indisponível. Escolha outro dia.';

    }


    return;

  }


  const fallback =
    localFallbackConfig();


  const hours =
    publicConfig
      ?.settings
      ?.hours ||
    fallback.settings.hours;


  const day =
    selectedDay();


  const schedule =
    hours[day] ||
    fallback.settings.hours[day];


  if (
    !schedule ||
    schedule.closed
  ) {

    resetTimeOptions(
      'Dia fechado'
    );

    return;

  }


  resetTimeOptions(
    'Carregando horários...'
  );


  const booked =
    await getBookedTimes(
      dateInput.value
    );


  const allSlots =
    generateTimeSlots(
      schedule.open,
      schedule.close
    );


  const freeSlots =
    allSlots.filter(
      slot => {

        const alreadyBooked =
          booked.includes(
            slot
          );


        const past =
          isPastSlot(
            dateInput.value,
            slot
          );


        return (
          !alreadyBooked &&
          !past
        );

      }
    );


  if (
    freeSlots.length === 0
  ) {

    resetTimeOptions(
      'Sem horários livres'
    );


    if (help) {

      help.textContent =
        'Este dia está sem horários livres. Escolha outro dia.';

    }


    return;

  }


  timeInput.innerHTML =
    `
      <option value="">
        Selecione um horário livre
      </option>
    `;


  freeSlots.forEach(
    slot => {

      const option =
        document.createElement(
          'option'
        );


      option.value =
        slot;


      option.textContent =
        slot;


      timeInput.appendChild(
        option
      );

    }
  );


  timeInput.disabled =
    false;


  if (help) {

    help.textContent =
      `Horários disponíveis das ${schedule.open} às ${schedule.close}.`;

  }

}


dateInput?.addEventListener(
  'change',
  refreshTimeOptions
);


/* =========================================================
   SALVAR AGENDAMENTO

   IMPORTANTE:
   SE /api/bookings NÃO EXISTIR,
   NÃO BLOQUEIA O WHATSAPP.

   SALVA LOCALMENTE E CONTINUA.
========================================================= */

async function saveBooking(
  payload
) {

  try {

    const response =
      await fetch(
        '/api/bookings',
        {

          method:
            'POST',

          headers: {

            'Content-Type':
              'application/json'

          },

          body:
            JSON.stringify(
              payload
            )

        }
      );


    let data = {};


    try {

      data =
        await response.json();

    } catch {}


    if (
      !response.ok
    ) {

      throw new Error(
        data.message ||
        'Servidor de agendamento indisponível'
      );

    }


    return {

      ok: true,

      stored:
        true

    };


  } catch (error) {


    /*
      NÃO INTERROMPE
      O AGENDAMENTO.
    */

    console.warn(
      'Não foi possível salvar no servidor. Salvando localmente.',
      error
    );


    try {

      const local =
        JSON.parse(
          localStorage.getItem(
            'jd_bookings_fallback'
          ) || '[]'
        );


      local.unshift({

        id:
          typeof crypto !==
            'undefined' &&
          crypto.randomUUID
            ? crypto.randomUUID()
            : String(
                Date.now()
              ),

        createdAt:
          new Date()
            .toISOString(),

        status:
          'pendente',

        ...payload

      });


      localStorage.setItem(
        'jd_bookings_fallback',
        JSON.stringify(
          local
        )
      );


    } catch (
      storageError
    ) {

      console.warn(
        'Não foi possível salvar localmente.',
        storageError
      );

    }


    /*
      MESMO SE TUDO FALHAR,
      RETORNA OK PARA O
      WHATSAPP ABRIR.
    */

    return {

      ok: true,

      stored:
        false

    };

  }

}


/* =========================================================
   ENVIAR AGENDAMENTO
========================================================= */

bookingForm?.addEventListener(
  'submit',
  async event => {

    event.preventDefault();


    const status =
      $('#formStatus');


    /*
      VALIDAÇÃO DOS CAMPOS
    */

    if (
      !bookingForm.checkValidity()
    ) {

      bookingForm.reportValidity();


      if (status) {

        status.textContent =
          'Preencha os campos obrigatórios para continuar.';

      }


      return;

    }


    if (
      !dateInput?.value
    ) {

      if (status) {

        status.textContent =
          'Escolha um dia disponível.';

      }


      return;

    }


    if (
      !timeInput?.value
    ) {

      if (status) {

        status.textContent =
          'Escolha um horário disponível.';

      }


      return;

    }


    /*
      DADOS DO FORMULÁRIO
    */

    const name =
      $('#name')
        ?.value
        ?.trim() ||
      'Cliente';


    const phone =
      $('#phone')
        ?.value
        ?.trim() ||
      'Não informado';


    const service =
      $('#service')
        ?.value ||
      'Não informado';


    const selectedDate =
      dateInput.value;


    const selectedTime =
      timeInput.value;


    const firstVisit =
      $('#firstVisit')
        ?.value ||
      'Não informado';


    const notes =
      $('#notes')
        ?.value
        ?.trim() ||
      'Sem observações.';


    /*
      DIA VISÍVEL:
      EXEMPLO "SEGUNDA-FEIRA"
    */

    const weekDay =
      prettyDate(
        selectedDate
      );


    /*
      PAYLOAD PARA SALVAR
    */

    const payload = {

      name,

      phone,

      service,

      date:
        selectedDate,

      day:
        weekDay,

      time:
        selectedTime,

      firstVisit,

      notes

    };


    if (status) {

      status.textContent =
        'Preparando seu agendamento...';

    }


    /*
      TENTA SALVAR,
      MAS NUNCA BLOQUEIA
      O WHATSAPP.
    */

    await saveBooking(
      payload
    );


    /*
      MENSAGEM COMPLETA
      DO WHATSAPP
    */

    const message = [

      'Olá, Studio JD! 💗',

      '',

      'Gostaria de solicitar um agendamento.',

      '',

      `👤 Nome: ${name}`,

      `📱 WhatsApp: ${phone}`,

      `💅 Serviço: ${service}`,

      `📅 Dia: ${weekDay}`,

      `⏰ Horário: ${selectedTime}`,

      `✨ Primeira visita: ${firstVisit}`,

      `📝 Observações: ${notes}`,

      '',

      'Pode confirmar meu atendimento, por favor? 💗'

    ].join('\n');


    /*
      NÚMERO DO WHATSAPP
    */

    let whatsapp =
      publicConfig
        ?.settings
        ?.whatsapp ||
      '5561981735176';


    /*
      REMOVE QUALQUER
      CARACTERE QUE NÃO
      SEJA NÚMERO.
    */

    whatsapp =
      String(
        whatsapp
      ).replace(
        /\D/g,
        ''
      );


    if (
      !whatsapp
    ) {

      whatsapp =
        '5561981735176';

    }


    const whatsappURL =
      `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;


    if (status) {

      status.textContent =
        'Tudo certo! Abrindo o WhatsApp…';

    }


    /*
      ABRE O WHATSAPP
    */

    window.location.href =
      whatsappURL;

  }
);


/* =========================================================
   MÁSCARA DO TELEFONE
========================================================= */

phoneInput?.addEventListener(
  'input',
  event => {

    let value =
      event.target.value
        .replace(
          /\D/g,
          ''
        )
        .slice(
          0,
          11
        );


    if (
      value.length > 10
    ) {

      value =
        value.replace(
          /(\d{2})(\d{5})(\d{4})/,
          '($1) $2-$3'
        );


    } else if (
      value.length > 6
    ) {

      value =
        value.replace(
          /(\d{2})(\d{4})(\d{0,4})/,
          '($1) $2-$3'
        );


    } else if (
      value.length > 2
    ) {

      value =
        value.replace(
          /(\d{2})(\d{0,5})/,
          '($1) $2'
        );


    } else if (
      value.length
    ) {

      value =
        value.replace(
          /(\d{0,2})/,
          '($1'
        );

    }


    event.target.value =
      value;

  }
);


/* =========================================================
   ANO AUTOMÁTICO
========================================================= */

const yearElement =
  $('#year');


if (
  yearElement
) {

  yearElement.textContent =
    new Date()
      .getFullYear();

}


/* =========================================================
   INICIAR SITE
========================================================= */

loadPublicConfig();