import axios from "axios"
import DOMPurify from "dompurify"

export default class Address {
  constructor() {
    this.districtPart = document.getElementById("districtPart")
    this.policeStationPart = document.getElementById("policeStationPart")
    this.postOfficePart = document.getElementById("postOfficePart")
    this.policeStations=[]
    this.postOffices=[]
    this.events()
  }

// 2. Events
events() {
  this.districtPart.addEventListener("change", () => this.getPoliceStations())
  this.policeStationPart.addEventListener("change", () => this.getPostOffices())
  }


getPoliceStations() {
  console.log("District part selected")
  
  if(this.districtPart.value=="Darjeeling"){
    this.policeStations=["Siliguri","Naxalbari","Phansidewa"]
  }
  if(this.districtPart.value=="Jalpaiguri"){
    this.policeStations=["Alipurduar","Dhupguri","Falakata"]
  }
  

  this.postOfficePart.innerHTML=""
  this.policeStationPart.innerHTML=""
  let tag=document.createElement("option")
      tag.value=""
      tag.innerHTML="--Select Near by Area--"
      this.policeStationPart.options.add(tag)
  this.policeStations.forEach((station)=>{
    let newOption=document.createElement("option")
    newOption.value=station
    newOption.innerHTML=station
    this.policeStationPart.options.add(newOption)
  })

}

getPostOffices() {
  if(this.policeStationPart.value=="Siliguri"){
    this.postOffices=["Champasari","Matigara","Gulma"]
  }
  if(this.policeStationPart.value=="Naxalbari"){
    this.postOffices=["Sahabad","Kamala Bagan","Hatighisa"]
  }
  if(this.policeStationPart.value=="Phansidewa"){
    this.postOffices=["bindubari","Chitalghata","Chathat"]
  }
  if(this.policeStationPart.value=="Alipurduar"){
    this.postOffices=["Atiabaribagan","Baruipara","Bhatibari"]
  }
  if(this.policeStationPart.value=="Dhupguri"){
    this.postOffices=["Bairatiguri","Bamni","Banarhat"]
  }
  if(this.policeStationPart.value=="Falakata"){
    this.postOffices=["Alinagar","Badaitari","Baganbari"]
  }
  this.postOfficePart.innerHTML=""
  let tag=document.createElement("option")
      tag.value=""
      tag.innerHTML="--Select Near by Area--"
      this.postOfficePart.options.add(tag)
  this.postOffices.forEach((postOffice)=>{
    let newOption=document.createElement("option")
    newOption.value=postOffice
    newOption.innerHTML=postOffice
    this.postOfficePart.options.add(newOption)
  })
}

// sendRequestPoliceStations() {
//   axios
//     .post("/policeStations", { district: this.districtPart.value })
//     .then(areas => {
//       console.log("PoliceStations:",areas)
//       this.policeStations=areas
//     })
//     .catch(() => {
//       alert("Hello, the request failed.")
//     })
// }

// sendRequestPostOffices() {
//   axios
//     .post("/postOffices", { policeStation: this.policeStationPart.value })
//     .then(areas => {
//       this.postOffices=areas
//     })
//     .catch(() => {
//       alert("Hello, the request failed.")
//     })
// }
}