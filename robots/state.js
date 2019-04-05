const fs = require('fs')
const contentFilePatch = './content.json'

function save(content){
  const contentSavestring = JSON.stringify(content)
  return fs.writeFileSync(contentFilePatch,contentSavestring)
}

function load(content){
  const fileBuffer = fs.readFileSync(contentFilePatch)
  const contentjson = JSON.parse(fileBuffer)
  return contentjson
}
module.exports = {
  save,
  load
}
