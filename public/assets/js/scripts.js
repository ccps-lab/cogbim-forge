// correct password is `password` lol

const $ = (s, o = document) => o.querySelector(s);
const $$ = (s, o = document) => o.querySelectorAll(s);

const login = $("#login-form");
const passwordContainer = $(".password", login);
const password = $("input", passwordContainer);
const passwordList = $(".dots", passwordContainer);
const submit = $("button", login);

password.addEventListener("input", (e) => {
  if (password.value.length > $$("i", passwordList).length) {
    passwordList.appendChild(document.createElement("i"));
  }
  submit.disabled = !password.value.length;
  passwordContainer.style.setProperty(
    "--cursor-x",
    password.value.length * 10 + "px"
  );
});

let pressed = false;

password.addEventListener("keydown", (e) => {
  if (
    pressed ||
    login.classList.contains("processing") ||
    (password.value.length > 14 && e.keyCode != 8 && e.keyCode != 13)
  ) {
    e.preventDefault();
  }
  pressed = true;

  setTimeout(() => (pressed = false), 50);

  if (e.keyCode == 8) {
    let last = $("i:last-child", passwordList);
    if (last !== undefined && last) {
      last.classList.add("remove");
      setTimeout(() => last.remove(), 50);
    }
  }
});

password.addEventListener("select", function () {
  this.selectionStart = this.selectionEnd;
});

login.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(login);

  const searchParams = new URLSearchParams();

  for (const pair of formData) {
    searchParams.append(pair[0], pair[1]);
  }

  if (!login.classList.contains("processing")) {
    login.classList.add("processing");
    setTimeout(() => {
      fetch("/login", {
        method: "POST",
        body: searchParams,
      })
        .then((response) => {
          return response.status;
        })
        .then((data) => {
          // let cls = password.value == "password" ? "success" : "error";
          let cls = data == 200 ? "success" : "error";

          login.classList.add(cls);
          if (cls == "success") {
            setTimeout(() => {
              redirect: window.location.replace("/");
            }, 2500);
          }
          setTimeout(() => {
            login.classList.remove("processing", cls);
            if (cls == "error") {
              password.value = "";
              passwordList.innerHTML = "";
              submit.disabled = true;
            }
          }, 2000);
          setTimeout(() => {
            if (cls == "error") {
              passwordContainer.style.setProperty("--cursor-x", 0 + "px");
            }
          }, 600);
        });
    }, 1500);
  }
});
