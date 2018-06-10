"use strict"

;(function customCode(window){

  
  class Model {

    constructor (questionArray) {
      this.array = questionArray
      this.pool = []
    }


    setQuestionPool (options = {
      pronoun: undefined
    , verb: undefined
    , multiple: undefined
    , shuffle: undefined
    }) {

      let forPronoun = (phraseData) => {
        if (options.pronoun) {
          console.log(phraseData.phrase)
          return phraseData.pronouns.indexOf(options.pronoun) > -1
        } else {
          return true
        }
      }

      let forVerb = (phraseData) => {
        if (options.verb) {
          // console.log(phraseData.phrase)

          return phraseData.verbs.indexOf(options.verb) > -1
        } else {
          return true
        }
      }

      let forMultiple = (phraseData) => {
        if (options.multiple !== undefined) {
          let include = options.multiple
                     ? phraseData.verbs.length > 1
                     : phraseData.verbs.length === 1
          return include
        } else {
          return true
        }
      }

      let pool = this.array.filter(forPronoun)
                           .filter(forVerb)
                           .filter(forMultiple)

      if (pool.length) {
        if (options.shuffle) {
          this._shuffle(pool)
        }

        this.pool = pool
      }

      // console.log(this.pool)
    }


    getNext() {
      let question = this.pool.shift()
      this.pool.push(question) // temporary

      if (!this.pool.length) {
        console.log("LAST QUESTION") // TODO
      }

      return question
    }


    getLast() {
      let question = this.pool.pop()
      this.pool.unshift(question)

      return question
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


  class ScoreKeeper {
    constructor () {

    }
  }


  class Controller {

    constructor (model) {
      this.setPool = model.setQuestionPool.bind(model)
      this.getNext = model.getNext.bind(model)
      this.getLast = model.getLast.bind(model)

      this.cueElement = document.querySelector("p.cue")
      this.last = document.querySelector("button.last")
      this.next = document.querySelector("button.next")
      this.table = document.querySelector("table")
      this.drag = document.querySelector("div.drag")
      this.mask = document.querySelector("div.mask")

      this.fadeDelay = 10 // fades in and out over 100 * 10 ms
      this.regex = /([^(]*)\((.+?)\)\s*&(.+?)&([^(]*)(\((.+?)\)\s*&(.+?)&)?(.*)/

      /*
      ([^(]*)                // everything up to first (   
      \((.+?)\)\s*&(.+?)&    // first infinitive + answer
      ([^(]*)                // everything up to next ( or to end
      (\((.+?)\)\s*&(.+?)&)? // optional second infinitive + answer
      (.*)                   // everything else
      */

      // Placeholders
      this.question = {}
      this.answers = []

      // TODO: Read options from contextual menus
      let options = { 
      //   pronoun: "я"
      // , verb: "идти"
      // , multiple: true
      }

      this.setPool(options)

      let listener = this.checkInput.bind(this)
      this.cueElement.addEventListener("input", listener, true)

      listener = this.showCheatSheet.bind(this)
      this.table.addEventListener("mousedown", listener, true)

      // listener = this.startDrag.bind(this)
      // this.table.addEventListener("mousedown", listener, true)

      listener = this.buttonPressed.bind(this)
      this.next.addEventListener("mouseup", listener, true)
      this.last.addEventListener("mouseup", listener, true)

      this.buttonPressed()
    }


    // INTERACTIONS // INTERACTIONS // INTERACTIONS // INTERACTIONS //

    checkInput(event) {
      // console.log("checkInput", event)
      let target = event.target
      let index = target.name

      // Ensure value and expected have the same format
      let value = target.value.toLowerCase()
                              .replace("́", "")
      let expected = this.answers[index].toLowerCase()
                                        .replace("́", "")

      let correct = value === expected
      if (!correct) {
        correct = (value === (expected.replace("ё", "е")))
      }

      if (correct) {
        target.value = this.answers[index] // with capitals, ё and ́
        target.disabled = true

        if (!--this.todo) { 
          this.next.disabled = false
          this.mask.classList.add("invisible")
          this.playReward()
        }
      }
    }


    showCheatSheet() {
      this.table.classList.toggle("open")
    }


    // startDrag(event) {
      //   let target = event.target
      //   let rect = target.getBoundingClientRect()



      //   let dragInflection = (event) => {

      //   }

      //   let stopDrag = () => {
      //     this.drag.style = "display:none;"
      //   }

      //   this.drag.style = "display:block;" 
      //                   + "left:" + rect.left + "px;"
      //                   + "top:"  + rect.top  + "px;"
      //                   + "width:" + rect.width + "px;"
      //   this.drag.innerText = target.innerText

      //   document.body.onmousemove = dragInflection
      //   document.body.onmouseup = stopDrag
    // }


    buttonPressed(event) {
      this.mask.classList.remove("invisible")
      this.table.classList.remove("open")

      if (this.state === "playing") {
        this.goNextOnPause = true
        return this.pausePlayback()
      }

      let shiftClick = event && event.shiftKey
      let isBackButton = event
                      && event.target.classList.contains("last")
      this.nextQuestion(isBackButton, shiftClick)
      this.goNextOnPause = false
      // this.next.disabled = true //XXXXXXXXXXXXXXXXXXXXXXXXXXXX//
    }


    // QUESTION MANAGEMENT // QUESTION MANAGEMENT // QUESTIONS //

    nextQuestion(isBackButton, showComplete) {
      let question = isBackButton
                   ? this.getLast()
                   : this.getNext()
      /* 
        { "phrase": "Мы (бежать) &бежим& с тобой по лужам."
        , "id": "qeXNepejiHE"
        , "verbs": ["бежать"]
        , "pronouns": ["мы"]
        , "start": 43
        }
      */
     
      this.prepareQuestion(question.phrase)
      this.videoOptions = { 
          videoId:          question.id
        , startSeconds:     question.start
        // , endSeconds:       question.end || question.start + 10
        // , suggestedQuality: "small"    
      }

      this.pauseDelay = (question.end-question.start) * 1000 || 3000
 
      if (showComplete) {
        this.showComplete()
      }
    }


    prepareQuestion(phrase) {
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

      this.answers = [match[3]]
      // a second answer may be added later

      let html = "<p class='cue'>"
               + match[1]
               + "<input type='text' placeholder='"
                 + match[2] + "' name='0' />"
               + match[4]

      if (match[5]) {
        // Add the second answer
        html += "<input type='text' placeholder='"
                + match[6] + "' name='1' />"
              + match[8]
        this.answers.push(match[7])
      }

      html += "</p>"

      this.todo = this.answers.length
      this.cueElement.innerHTML = html

      console.log(this.answers)
    }


    showComplete() {
      let answer = this.answers[0]
      let input = document.querySelector("input[name='0']")
      input.value = answer

      if (answer = this.answers[1]) {
        input = document.querySelector("input[name='1']")
        input.value = answer
      }

      this.mask.classList.add("invisible")
      this.playReward()
    }


    // VIDEO // VIDEO // VIDEO // VIDEO // VIDEO // VIDEO // VIDEO //

    setPlayer(YTPlayer) {
      console.log("YouTube Player loaded")
      this.YTPlayer = YTPlayer
    }


    stateChange(event) {
      this.state = {
       "-1": "unstarted"
      , 0: "ended"
      , 1: "playing"
      , 2: "paused"
      , 3: "buffering"
      , 5: "video cued"
      }[event.data]

      console.log("stateChange", this.state)
    }


    playReward() {
      this.YTPlayer.loadVideoById(this.videoOptions)

      let pause = this.pausePlayback.bind(this)
      setTimeout(pause, this.pauseDelay)
    }


    pausePlayback()  {
      let fade = this.fade.bind(this)

      this.increment = -1
      this.fading = setInterval(fade, this.fadeDelay)
    }

    
    fade() {
      let volume = this.YTPlayer.getVolume() + this.increment

      this.YTPlayer.setVolume(volume)

      if (volume > 99 || volume < 1) {
        clearInterval(this.fading)
        this.fading = 0

        if (volume) {

        } else {
          this.YTPlayer.pauseVideo()
          this.YTPlayer.setVolume(100)
          // this.YTPlayer.unMute()

          if (this.goNextOnPause) {
            this.buttonPressed()
          }
        }
      }
    }
  }


  class DVI {
    constructor(questionArray) {
      let model = new Model(questionArray)
      this.controller = new Controller(model)
    }


    initializeYouTubePlayer() {
      let onPlayerStateChange = this.controller.stateChange.bind(this.controller)

      let player = new YT.Player('ytplayer', {
        height: '360'
      , width: '640'
        // videoId: 'M7lc1UVf-VE',
      , events: {
          // 'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      })

      this.controller.setPlayer(player)
    }
  }
  
  let questionArray = [
      { "phrase": "Мы (плыть) &плывём& на льдине."
      , "id": "nuOA--rq7vE" 
      , "verbs": ["плыть"]
      , "pronouns": ["мы"]
      , "start": 60
      , "end": 65
      }
    , { "phrase": "Мы (ехать) &едем& в далёкие края."
      , "id": "rqceEodDe5Q" 
      , "verbs": ["плыть"]
      , "pronouns": ["мы"]
      , "start": 4
      , "end": 9
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
    , { "phrase": "Когда (идти) &идёшь& ты не туда, придешь ли ты обратно?"
      , "id": "wQ9DPGXYTUc"  
      , "verbs": ["идти"]
      , "pronouns": ["ты"]
      , "start": 36
      }
    , { "phrase": "Ну что ж ты не (идти) &идёшь&, моя любовь?"
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
    , { "phrase": "Я спросил тебя: зачем (идти) &идёте& в горы вы?"
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
      , "end": 63
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