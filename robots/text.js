const algorithmia = require('algorithmia')
const sentenceBoundaryDetection = require('sbd')
const watsonApiKey = require('../credentials/watson-nlu.json').apikey
const fs = require('fs');



const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
  const nlu = new NaturalLanguageUnderstandingV1({
        iam_apikey: watsonApiKey,
        version: '2018-04-05',
        url: 'https://gateway.watsonplatform.net/natural-language-understanding/api'
      });


  //console.log(`Recebi com sucesso: ${content.searchTerm}`-verificando se o robo esta funcinando, nunca comente assim... )
const state = require('./state.js')
  async function robot(){
        const content = state.load()
        await fetchContentFromWikipedia(content)
        sanitizedContent(content)
        breakContentSentences(content)
        limitMaximumSentences(content)
        await fetchKeywordsOfAllSenteces(content)

        state.save(content)


async function fetchContentFromWikipedia(content){
    const algorithmiaAuthenticated = algorithmia('simIz8tzXkf44d/YUtgTCvu9Sel1')
    const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2?timeout=300')
    const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm)
    const wikipediaContent = wikipediaResponse.get()


    content.sourceContentOriginal = wikipediaContent.content

  }
    function sanitizedContent(content){
      const withoutBlankLinesAndMarkdown = removeBlanklinesAndMarkdown(content.sourceContentOriginal)
      const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)

      content.sourceContentSanitized = withoutDatesInParentheses

      function removeBlanklinesAndMarkdown(text){
        const allLines = text.split('\n')

      const withoutBlankLinesAndMarkdown = allLines.filter((line)=>{
        if (line.trim().length === 0|line.trim().startsWith('=')){
          return false
        }
          return true
      })
      return withoutBlankLinesAndMarkdown.join(' ')
      }
    }
      function removeDatesInParentheses(text) {
    return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
    }
    function breakContentSentences(content) {
    content.sentences = []


    const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
    sentences.forEach((sentence) => {
      content.sentences.push({
        text: sentence,
        keywords: [ ],
        images: [ ]
          })
      })
    }
}
function limitMaximumSentences(content){
   content.sentences = content.sentences.slice(0, content.maximumSentences)
}
async function fetchKeywordsOfAllSenteces(content) {
  for (const sentence  of content.sentences) {
    sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)
  }
}
async function fetchWatsonAndReturnKeywords(sentence) {
   return new Promise((resolve,reject)=>{
     nlu.analyze({
         html: sentence,
         features: {
           keywords: {}
         }
       },(err, response)=> {
         if (err) {
           throw err;
         }
         const keywords = response.keywords.map((keyword)=>{
           return keyword.text
         })
         resolve(keywords)
       })
   })
}
module.exports = robot
