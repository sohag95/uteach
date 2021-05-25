import Search from "./modules/search"
import RegistrationForm from './modules/registrationForm'

if (document.querySelector(".header-search-icon")) {
  console.log("have search icon")
  new Search()
}
if (document.querySelector("#registration-form")) {
  console.log("registration id present")
  new RegistrationForm()
}