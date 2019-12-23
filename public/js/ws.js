let name = prompt("What\ts your name?");
while (!name) {
  name = prompt("What\ts your name?");
}

let socket_url = "ws://localhost:3000";
let socket = new WebSocket(socket_url);

let nodes = [];
let contacts = [];
let users = [];

socket.onopen = () => {
  if (name) socket.send(JSON.stringify({ type: "conn", name }));
};

socket.onmessage = event => {
  let data = {};
  try {
    data = JSON.parse(event.data);
  } catch (e) {
    return;
  }

  console.log("Recieved:", data);

  if (data.type == "allmsgs") {
    // when user gets connected
    let msg_body = document.getElementById("message_section");
    let new_joined = document.createElement("span");
    new_joined.innerHTML = `<li style="text-align:center"; class="sent">
      <p>
        You joined conversation
      </p>
    </li>`;

    msg_body.appendChild(new_joined);

    // all connected users
    if (data.users.length) {
      for (let i = 0; i < data.users.length; i++) {
        let new_contact = document.createElement("span");
        new_contact.id = data.users[i].name + "__";
        new_contact.innerHTML = `
        <li class="contact activee">
              <div class="wrap">
                <span class="contact-status online"></span>
                <img src="http://emilcarlsson.se/assets/louislitt.png" alt="" />
                <div class="meta">
                  <p class="name">${data.users[i].name}</p>
                  <p class="preview">available</p>
                </div>
              </div>
            </li>`;
        contacts.push(new_contact);
      }
      let contacts_list = document.getElementById("contacts_list");
      for (let i = 0; i < contacts.length; i++) {
        contacts_list.appendChild(contacts[i]);
      }
    }

    if (!data.messages.length) {
      let prev_msg = document.createElement("span");
      prev_msg.innerHTML = `<li style="text-align:center"; class="sent">
        <p>
          No previous message found
        </p>
      </li>`;

      msg_body.appendChild(prev_msg);
      return;
    }
    for (let i = 0; i < data.messages.length; i++) {
      let newMsg = document.createElement("span");
      newMsg.innerHTML = `<li class="sent">
        <img src="http://emilcarlsson.se/assets/mikeross.png" alt="" />
        <p>
          ${data.messages[i].msg}
        </p>
      </li>`;
      nodes.push(newMsg);
    }
  } else if (data.type == "msg") {
    // when someone sends msg
    let msg_body = document.getElementById("message_section");
    let new_msg = document.createElement("span");
    new_msg.innerHTML = `<li class="sent">
      <img src="http://emilcarlsson.se/assets/mikeross.png" alt="" />
      <p>
        ${data.msg}
      </p>
    </li>`;
    msg_body.appendChild(new_msg);
  } else if (data.type == "conn") {
    // when some new visitor joins the chat
    let new_contact = document.createElement("span");
    new_contact.id = data.name + "__";
    new_contact.innerHTML = `
    <li class="contact activee">
          <div class="wrap">
            <span class="contact-status online"></span>
            <img src="http://emilcarlsson.se/assets/louislitt.png" alt="" />
            <div class="meta">
              <p class="name">${data.name}</p>
              <p class="preview">available</p>
            </div>
          </div>
        </li>`;
    let contacts_section = document.getElementById("contacts_list");
    contacts_section.appendChild(new_contact);

    let msg_body = document.getElementById("message_section");
    let new_joined = document.createElement("span");
    new_joined.innerHTML = `<li style="text-align:center"; class="sent">
      <p>
        ${data.name} joined conversation
      </p>
    </li>`;

    msg_body.appendChild(new_joined);
  } else if (data.type == "disconn") {
    let msg_body = document.getElementById("message_section");
    let new_joined = document.createElement("span");
    new_joined.innerHTML = `<li style="text-align:center"; class="sent">
      <p>
        ${data.name} left conversation
      </p>
    </li>`;

    msg_body.appendChild(new_joined);
    document.getElementById(data.name + "__").remove();
};

window.onload = () => {
  document.getElementById("type_msg").focus();
  
  // send message
  document
    .getElementById("submit")
    .addEventListener("click", sendMessge);
  document
    .getElementById("type_msg")
    .addEventListener("keydown", event => {
      if (event.key == "Enter") sendMessge();
    });

  function sendMessge() {
    let = message = $(".message-input input").val();
    if ($.trim(message) == "") {
      return false;
    }

    $(
      '<li class="replies"><img src="http://emilcarlsson.se/assets/mikeross.png" alt="" /><p>' +
        message +
        "</p></li>"
    ).appendTo($(".messages ul"));
    $(".message-input input").val(null);
    $(".contact.active .preview").html("<span>You: </span>" + message);
    $(".messages").animate({ scrollTop: $(document).height() }, "fast");

    let msg_body = document.getElementsByClassName("msg_card_body")[0];
    let your_msg = document.createElement("span");
    your_msg.innerHTML = `<div class="d-flex justify-content-end mb-4">
        <div class="msg_cotainer_send">
          ${msg}
         <!-- <span class="msg_time_send">8:55 AM, Today</span>-->
        </div>
        <div class="img_cont_msg">
          <img
            src="https://avatars.servers.getgo.com/emails/%7B0%7D/medium.jpg"
            class="rounded-circle user_img_msg"
          />
        </div>
      </div>`;
    msg_body.appendChild(your_msg);

    socket.send(JSON.stringify({ type: "msg", msg }));

    document.getElementsByClassName("type_msg")[0].value = "";
    document.getElementsByClassName("type_msg")[0].focus();
    // scroll
    msg_body.scrollTop = msg_body.scrollHeight;
  }
};
