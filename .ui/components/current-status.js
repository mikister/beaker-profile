const ONLINE = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="90" height="20"><linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient><clipPath id="r"><rect width="90" height="20" rx="3" fill="#fff"/></clipPath><g clip-path="url(#r)"><rect width="45" height="20" fill="#555"/><rect x="45" width="45" height="20" fill="#4c1"/><rect width="90" height="20" fill="url(#s)"/></g><g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110"><text x="235" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="350">Status</text><text x="235" y="140" transform="scale(.1)" textLength="350">Status</text><text x="665" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="350">Online</text><text x="665" y="140" transform="scale(.1)" textLength="350">Online</text></g></svg>`;

const OFFLINE = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="90" height="20"><linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient><clipPath id="r"><rect width="90" height="20" rx="3" fill="#fff"/></clipPath><g clip-path="url(#r)"><rect width="45" height="20" fill="#555"/><rect x="45" width="45" height="20" fill="#e05d44"/><rect width="90" height="20" fill="url(#s)"/></g><g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110"><text x="235" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="350">Status</text><text x="235" y="140" transform="scale(.1)" textLength="350">Status</text><text x="665" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="350">Offline</text><text x="665" y="140" transform="scale(.1)" textLength="350">Offline</text></g></svg>`;

export class CurrentStatus extends HTMLElement {
  constructor() {
    super();
    this.currentStatus = "Offline";
    this.hearbeatInterval = 5000;
    this.offset = 1000;
    const shadowRoot = this.attachShadow({ mode: "open" });
    this.container = document.createElement("div");
    this.container.id = "status";
    this.shadowRoot.innerHTML = ``;
    this.peers = new Set();
    shadowRoot.appendChild(this.container);
  }

  async connectedCallback() {
    const info = await beaker.hyperdrive.getInfo(
      "hyper://" + window.location.host
    );
    this.isOwner = info.writable;
    this.statusTopic = beaker.peersockets.join("status");
    this.peerEvents = beaker.peersockets.watch();
    if (this.isOwner) {
      //logic for owners
      this.currentStatus = "Online";
      //when a peer joins, tell them you are online!
      this.peerEvents.addEventListener("join", (e) => {
        this.peers.add(e.peerId);
        this.statusTopic.send(
          e.peerId,
          new TextEncoder("utf-8").encode("Online")
        );
      });

      this.peerEvents.addEventListener("leave", (e) => {
        this.peers.delete(e.peerId);
      });

      //send heartbeat interval
      setInterval(() => {
        this.peers.forEach((peer) => {
          this.statusTopic.send(
            peer,
            new TextEncoder("utf-8").encode("Online")
          );
        });
      }, this.hearbeatInterval);
    } else {
      this.peerEvents.addEventListener("join", (e) => {
        console.log(e.peerId);
      });
      //logic for non-owners

      this.statusTopic.addEventListener("message", (e) => {
        const message = new TextDecoder().decode(e.message);
        if (message === "Online") {
          if (this.timer) clearTimeout(this.timer);
          this.currentStatus = "Online";
          //set timeout if no response
          this.timer = setTimeout(() => {
            this.currentStatus = "Offline";
            this.render();
          }, this.hearbeatInterval + this.offset);
          this.render();
        }
      });
    }
    this.render();
  }

  render() {
    if (this.currentStatus === "Online") {
      this.container.innerHTML = ONLINE;
    } else {
      this.container.innerHTML = OFFLINE;
    }
  }
}

customElements.define("current-status", CurrentStatus);
