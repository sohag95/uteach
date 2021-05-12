const bcrypt = require("bcryptjs")
const userCollection = require("../db").db().collection("users")

let Password = function (data) {
  this.data = data
  this.errors = []
}

Password.prototype.changePassword = function (username) {
   return new Promise(async (resolve, reject) => {
    try {
      //cleaning up data
      if (typeof this.data.passwordNew1 != "string") {
        this.data.passwordNew1 = ""
      }
      if (typeof this.data.passwordOld != "string") {
        this.data.passwordOld = ""
      }
      //validating data
      if (this.data.passwordNew1 == "") {
        this.errors.push("You must provide a password.")
      }
      if (this.data.passwordNew1.length > 0 && this.data.passwordNew1.length < 12) {
        this.errors.push("Password must be at least 12 characters.")
      }
      if (this.data.passwordNew1.length > 50) {
        this.errors.push("Password cannot exceed 50 characters.")
      }
      if (!this.errors.length) {
          let user = await userCollection.findOne({ username: username })
          if (user && bcrypt.compareSync(this.data.passwordOld, user.password)) {
            this.updatePassword(username)
              .then(() => {
                resolve()
              })
              .catch(() => {
                reject()
              })
          } else {
            this.errors.push("Your old password is not matching!! Try again....")
            reject(this.errors)
          }
      } else {
        reject(this.errors)
      }
    } catch {
      reject()
    }
  })
}

Password.prototype.updatePassword = function (username) {
  return new Promise(async (resolve, reject) => {
    try {
      let salt = bcrypt.genSaltSync(10)
      this.data.passwordNew = bcrypt.hashSync(this.data.passwordNew1, salt)
        await userCollection.findOneAndUpdate(
          { username: username },
          {
            $set: {
              password: this.data.passwordNew
            }
          }
        )
        resolve()
    } catch {
      reject()
    }
  })
}

module.exports = Password
