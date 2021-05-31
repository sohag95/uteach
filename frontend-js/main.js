import Search from "./modules/search"
import RegistrationForm from './modules/registrationForm'
import Address from './modules/address'
import Chat from './modules/chat'


if (document.querySelector(".header-search-icon")) {
  console.log("have search icon")
  new Search()
}
if (document.querySelector(".message-header")) {
  console.log("have message container.")
  new Chat()
}
if (document.querySelector("#registration-form")) {
  console.log("registration id present")
  new RegistrationForm()
}

if (document.querySelector("#address-part")) {
  console.log("Address part exists.")
  new Address()
}