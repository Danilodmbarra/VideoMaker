const algorithmia = require('algorithmia')
const sentenceBoundaryDetection = require('sbd')
async function robot(content){
      await fetchContentFromWikipedia(content)
      sanitizedContent(content)
      breakContentSentences(content)


  //console.log(`Recebi com sucesso: ${content.searchTerm}`-verificando se o robo esta funcinando, nunca comente assim... )
async function fetchContentFromWikipedia(content){
    const algorithmiaAuthenticated = algorithmia('simIz8tzXkf44d/YUtgTCvu9Sel1')
    const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2?timeout=300')
    const wikipediaResponde = await wikipediaAlgorithm.pipe(content.searchTerm)
    const wikipediaContent = wikipediaResponde.get()


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
        keywords: [],
        images: []
          })
      })

    }
}
module.exports = robot
