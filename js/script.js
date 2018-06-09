"use strict"

;(function customCode(window){


  class Answers {
    constructor (questions) {
      // console.log("constructor")
      this.input = document.querySelector("input[name=answer]")
      this.ready = false
      this.player = undefined
      this.questions = questions

      let listener = this.check.bind(this)
      this.input.addEventListener("input", listener, true)
    }


    check(event) {
      let value = event.target.value
      if (!this.ready || value.toLowerCase() !== "blank") {
        return
      }

      let player = this._getPlayer()

      if (this.player) {
        let options = {
          videoId:          "M7lc1UVf-VE"
        , startSeconds:     2
        , endSeconds:       4
        , suggestedQuality: "small"
        }

        // small: Player height is 240px
        //        and player dimensions are at least 320px by 240px
        //        for 4:3 aspect ratio.
        // medium: Player height is 360px
        //         and player dimensions are 640px by 360px
        //         (for 16:9 aspect ratio)
        //         or 480px by 360px (for 4:3 aspect ratio).
        // large: Player height is 480px, and player dimensions are 853px by 480px (for 16:9 aspect ratio) or 640px by 480px (for 4:3 aspect ratio).
        // hd720: Player height is 720px, and player dimensions are 1280px by 720px (for 16:9 aspect ratio) or 960px by 720px (for 4:3 aspect ratio).
        // hd1080: Player height is 1080px, and player dimensions are 1920px by 1080px (for 16:9 aspect ratio) or 1440px by 1080px (for 4:3 aspect ratio).
        // highres: Player height is greater than 1080px, which means that the player's aspect ratio is greater than 1920px by 1080px.
        // default

        // console.log(this.player.loadVideoById)

        this.player.loadVideoById(options)
      }   
    }

    _getPlayer() {
      // if (!this.player) {
      //   this.player = new YT.Player('ytplayer', {
      //     height: '360',
      //     width: '640',
      //     // videoId: 'M7lc1UVf-VE'
      //   })
      // }

      return this.player
    }
  }


  class ScoreKeeper {
    constructor () {

    }
  }


  class Viewer {
    constructor (questions) {
      this.cueElement = document.querySelector("p.cue")
      this.input = this.cueElement.querySelector("input")

      this.getNext = questions.getNext.bind(questions)
      this.regex = /([^(]*)\((.+?)\)\s*&(.+?)&([^(]*)(\((.+?)\)\s*&(.+?)&)?(.*)/

      
      /*
      ([^(]*)                // everything up to first (   
      \((.+?)\)\s*&(.+?)&    // first infinitive + answer
      ([^(]*)                // everything up to next ( or to end
      (\((.+?)\)\s*&(.+?)&)? // optional second infinitive + answer
      (.*)                   // everything else
      */
    }

    showNextQuestion() {
      let question = this.getNext()
      /* 
        { "phrase": "Мы (бежать) &бежим& с тобой по лужам."
        , "id": "qeXNepejiHE"
        , "verbs": ["бежать"]
        , "pronouns": ["мы"]
        , "start": 43
        }
      */
      let phrase = question.phrase
      let videoOptions = { 
          videoId:          question.id
        , startSeconds:     question.start
        , endSeconds:       question.end || question.start + 3
        // , suggestedQuality: "small"    
      }

      console.log("phrase", '"' + phrase  + '"')
      console.log("options", videoOptions)
      // console.log(question)

      let match = this.regex.exec(phrase)

      // console.log(match)
      // 
      // [ 
      // 0: "Я по улице (идти) &иду&, я улыбку всем дарю."
      // 1: "Я по улице "
      // 2: "идти"
      // 3: "иду"
      // 4: ", я улыбку всем дарю."
      // 5: undefined || second complete match
      // 6: undefined || second infinitive
      // 7: undefined || second answer
      // 8: ""        || everything after second answer
      // . groups: undefined
      // . index: 0
      // . input: "Я по улице (идти) &иду&, я улыбку всем дарю."
      // . length: 9
      // ]

      let answers = [match[2]]
      let html = "<p class='cue'>"
               + match[1]
               + "<input type='text' placeholder='"
                 + match[2] + "' name='a' />"
               + match[4]
      if (match[5]) {
        html += "<input type='text' placeholder='"
                + match[6] + "' name='b' />"
              + match[7]
      }
      html += "</p>"

      this.cueElement.innerHTML = html
    }
  }

  
  class Questions {

    constructor (questionArray) {
      this.array = questionArray
      this.pool = []
    }


    setQuestionPool (options={ dontShuffle: false }) {
      var pool

      var forPronoun = (phraseData) => {
        if (options.pronoun) {
          console.log(phraseData.phrase)
          return phraseData.pronouns.indexOf(options.pronoun) > -1
        } else {
          return true
        }
      }

      var forVerb = (phraseData) => {
        if (options.verb) {
          // console.log(phraseData.phrase)

          return phraseData.verbs.indexOf(options.verb) > -1
        } else {
          return true
        }
      }

      var pool = this.array.filter(forPronoun)
      // console.log("****")
      pool = pool.filter(forVerb)

      if (pool.length) {
        if (!options.dontShuffle) {
          this._shuffle(pool)
        }

        this.pool = pool
      }

      // console.log(this.pool)
    }


    getNext() {
      return this.pool.shift()
    }


    _shuffle(array) {
      var j, x, i;
      for (i = array.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = array[i];
        array[i] = array[j];
        array[j] = x;
      }
    }
  }


  class Controller {
    constructor (questions) {
      this.questions = questions

      let options = { 
      //   pronoun: "я"
      // , verb: "идти"
      }
      questions.setQuestionPool(options)
    }
  }


  class DVI {
    constructor(questionArray) {
      this.questions = new Questions(questionArray)
      this.viewer = new Viewer(this.questions)
      this.controller = new Controller(this.questions)

      this.nextQuestion()
    }


    nextQuestion() {
      this.viewer.showNextQuestion()
    }


    initializeYouTubePlayer() {
      this.ready = true

      this.player = new YT.Player('ytplayer', {
        height: '360'
      , width: '640'
        // videoId: 'M7lc1UVf-VE'
      })
    }
  }
  
  let questionArray = [
    { "phrase": "Мы (плыть) &плывём& на льдине."
      , "id": "nuOA--rq7vE" 
      , "verbs": ["плыть"]
      , "pronouns": ["мы"]
      , "start": 0
      }
    , { "phrase": "Мы (ехать) &едем& в далёкие края."
      , "id": "rqceEodDe5Q" 
      , "verbs": ["плыть"]
      , "pronouns": ["мы"]
      , "start": 0
      }
    , { "phrase": "Все (бежать) &бегут& и я (бежать) &бегу&."
      , "id": "GY2RZSbtVWk"  
      , "verbs": ["бежать"]
      , "pronouns": ["они", "я"]
      , "start": 0
      }
    , { "phrase": "Я (бежать) &бегу&."
      , "id": "Ri3tBycAOg0" 
      , "verbs": ["бежать"]
      , "pronouns": ["я"]
      , "start": 55
      }
    , { "phrase": "Я по улице (идти) &иду&, я улыбку всем дарю."
      , "id": "rjxoWMtgbxo" 
      , "verbs": ["идти"]
      , "pronouns": ["я"]
      , "start": 12
      }
    , { "phrase": "Когда (идти) &идешь& ты не туда, придешь ли ты обратно?"
      , "id": "wQ9DPGXYTUc"  
      , "verbs": ["идти"]
      , "pronouns": ["ты"]
      , "start": 36
      }
    , { "phrase": "Ну что ж ты не (идти) &идешь&, моя любовь?"
      , "id": "ZPzeocv2O7A" 
      , "verbs": ["идти"]
      , "pronouns": ["ты"]
      , "start": 53
      }
    , { "phrase": "Носорог (идти) &идёт&. Крокодил (плыть) &плывёт&."
      , "id": "x_piwY-YpGg" 
      , "verbs": ["идти", "плыть"]
      , "pronouns": ["он/она/оно"]
      , "start": 29
      }
    , { "phrase": "Куда (идти) &идём& мы с Пятачком?"
      , "id": "WB1TcOmbCrQ" 
      , "verbs": ["идти"]
      , "pronouns": ["мы"]
      , "start": 13
      }
    , { "phrase": "Я спросил тебя: зачем (идти) &идете& в горы вы?"
      , "id": "q1qNnNNpuC4" 
      , "verbs": ["идти"]
      , "pronouns": ["вы"]
      , "start": 5
      }
    , { "phrase": "Снег (идти) &идёт&. И всё вокруг чего-то ждёт."
      , "id": "vc6mB77esAI"
      , "verbs": ["идти"]
      , "pronouns": ["он"]
      , "start": 51
      }
    , { "phrase": "Я снова куда-то (ехать) &еду&."
      , "id": "LMYyje5Qu4c" 
      , "verbs": ["ехать"]
      , "pronouns": ["я"]
      , "start": 8
      }
    , { "phrase": "К нам (ехать) &едет& жених из-за границы!" 
      , "id": "SOQyUwcj71Q" 
      , "verbs": ["ехать"]
      , "pronouns": ["PRONOUN"]
      , "start": 6
      }
    , { "phrase": "Я кручу педали и с горы как птица (лететь) &лечу&."
      , "id": "6FS14Li3AdQ" 
      , "verbs": ["лететь"]
      , "pronouns": ["я"]
      , "start": 162
      }
    , { "phrase": "(лететь) &Летят& самолёты, (плыть) &плывут& корабли."
      , "id": "iLNjB2uUuUs" 
      , "verbs": ["лететь", "плыть"]
      , "pronouns": ["они"]
      , "start": 987
      }
    , { "phrase": "Ты (лететь) &летишь& куда, откуда?"
      , "id": "3mYj7aZPWTQ" 
    //, "id": "1ohlKfX6sGs?t=40s"  // ???????
      , "verbs": ["лететь"]
      , "pronouns": ["ты"]
      , "start": 37
      }
    , { "phrase": "Журавль по небу (лететь) &летит&."
      , "id": "9-pXfiXGwNQ"  
      , "verbs": ["лететь"]
      , "pronouns": ["он/она/оно"]
      , "start": 35
      }
    , { "phrase": "Но зато он плавать может. И по небу (лететь) &летит&!" 
      , "id": "ymqmJSOxvvI" 
      , "verbs": ["лететь"]
      , "pronouns": ["он/она/оно"]
      , "start": 32
      }
    , { "phrase": "Мы вдвоём (лететь) &летим& на облаке верхом."
      , "id": "S_059LyVKs0" 
      , "verbs": ["лететь"]
      , "pronouns": ["мы"]
      , "start": 7
      }
    , { "phrase": "Вы куда (лететь) &летите&, в Ниццу?"
      , "id": "75JjflWKs98"  
      , "verbs": ["лететь"]
      , "pronouns": ["вы"]
      , "start": 137
      }
    , { "phrase": "Вы к ним (лететь) &летите&? Отлично."
      , "id": "WTCBw3wJqkE" 
      , "verbs": ["лететь"]
      , "pronouns": ["вы"]
      , "start": 160
      }
    , { "phrase": "По синему морю к зелёной земле (плыть) &плыву& я на белом своём корабле."
      , "id": "LQsBJbMt17I" 
      , "verbs": ["плыть"]
      , "pronouns": ["я"]
      , "start": 5
      }
    , { "phrase": "Ты от меня (бежать) &бежишь&."
      , "id": "6sPy0xnk8J4" 
      , "verbs": ["бежать"]
      , "pronouns": ["ты"]
      , "start": 27
      }
    , { "phrase": "(бежать) &Бежит& по лесу круглый ёж. (бежать) &Бежит& и поёт, что он на круг похож."
      , "id": "l9NX1xOHitk" 
      , "verbs": ["бежать"]
      , "pronouns": ["он/она/оно"]
      , "start": 33
      }
    , { "phrase": "Мы (бежать) &бежим& с тобой по лужам."
      , "id": "qeXNepejiHE"
      , "verbs": ["бежать"]
      , "pronouns": ["мы"]
      , "start": 43
      }
  ]

  window.dvi = new DVI(questionArray)

})(window)