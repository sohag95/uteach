export default class Chat {
  constructor() {
   
    this.chatContainer = document.querySelector(".message-container")
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight
  }
}