"use strict"

;(function idLoaded(dvi){

  if (!dvi) {
    dvi = window.dvi = {}
  }


  class Model {
    constructor (questionArray) {
      this.array = questionArray
      this.pool = []

      this.setQuestionPool()
    }


    getNext() {
      let question = this.pool.shift()
      this.pool.push(question) // temporary

      if (!this.pool.length) {
        console.log("LAST QUESTION") // TODO
      }

      return question
    }


    getNext() {
      let question = this.pool.shift()
      this.pool.push(question) // temporary

      if (!this.pool.length) {
        console.log("LAST QUESTION") // TODO
      }

      return question
    }


    setQuestionPool () {
      this.pool = this.array.slice(0)
      this._shuffle(this.pool)
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
    constructor(model) {
      this.setPool = model.setQuestionPool.bind(model)
      this.getNext = model.getNext.bind(model)

      this.imgElement = document.querySelector("img")
      this.btnElement = document.querySelector("div.buttons")
      this.buttons = [].slice.call(this.btnElement.querySelectorAll("button"))

      this.correctDelay = 2000
      this.verb = ""

      let listener = this.checkAnswer.bind(this)
      this.btnElement.addEventListener("mousedown", listener, true)
      
      this.nextPressed()  
    }


    checkAnswer(event) {
      let target = event.target
      let verb = target.name

      if (verb === this.verb) {
        // The right verb was clicked. Highlight the answer, hide the
        // other answers, pause, then show a new image
        this.showCorrect(target)

      } else {
        target.disabled = true
      }
    }


    showCorrect(button) {
      this.buttons.forEach((element) => {
        if (element === button) {
          element.classList.add("correct")
        } else {
          element.disabled = true
        }
      })

      setTimeout(this.nextPressed.bind(this), this.correctDelay)
    }


    nextPressed(event) {
      let question = this.getNext()
      this.verb = question.verb
      this.imgElement.src = question.src

      this.buttons.forEach((button) => {
        button.disabled = false
        button.classList.remove("correct")
      })
    }
  }


  class Id {
    constructor (questionArray) {
      let model = new Model(questionArray)
      this.controller = new Controller(model)
    }
  }


  let questionArray = [
    { "src": "img/walk/dog.gif"
      , "verb": "идти́"
      }
    , { "src": "img/walk/duck.gif"
      , "verb": "идти́"
      }
    , { "src": "img/walk/fassbender.gif"
      , "verb": "идти́"
      }
    , { "src": "img/walk/flamingos.gif"
      , "verb": "идти́"
      }
    , { "src": "img/walk/penguin.gif"
      , "verb": "идти́"
      }
    , { "src": "img/walk/pug.gif"
      , "verb": "идти́"
      }
    , { "src": "img/walk/robot.gif"
      , "verb": "идти́"
      }
    , { "src": "img/walk/walk.gif"
      , "verb": "идти́"
      }
    , { "src": "img/walk/walking.gif"
      , "verb": "идти́"
      }
    , { "src": "img/walk/woman.gif"
      , "verb": "идти́"
      }

      // ехать
    , { "src": "img/drive/cyclist.gif"
      , "verb": "е́хать"
      }
    , { "src": "img/drive/desertCar.gif"
      , "verb": "е́хать"
      }
    , { "src": "img/drive/dogBike.gif"
      , "verb": "е́хать"
      }
    , { "src": "img/drive/dogCart.gif"
      , "verb": "е́хать"
      }
    , { "src": "img/drive/horse.gif"
      , "verb": "е́хать"
      }
    , { "src": "img/drive/metro.gif"
      , "verb": "е́хать"
      }
    , { "src": "img/drive/skateboard.gif"
      , "verb": "е́хать"
      }
    , { "src": "img/drive/skates.gif"
      , "verb": "е́хать"
      }
    , { "src": "img/drive/train.gif"
      , "verb": "е́хать"
      }
    , { "src": "img/drive/trucks.gif"
      , "verb": "е́хать"
      }

      // бежать
    , { "src": "img/run/bird.gif"
      , "verb": "бежа́ть"
      }
    , { "src": "img/run/cartoon.gif"
      , "verb": "бежа́ть"
      }
    , { "src": "img/run/cat.gif"
      , "verb": "бежа́ть"
      }
    , { "src": "img/run/chaplin.gif"
      , "verb": "бежа́ть"
      }
    , { "src": "img/run/daschund.gif"
      , "verb": "бежа́ть"
      }
    , { "src": "img/run/dog.gif"
      , "verb": "бежа́ть"
      }
    , { "src": "img/run/dogInPool.gif"
      , "verb": "бежа́ть"
      }
    , { "src": "img/run/jesus.gif"
      , "verb": "бежа́ть"
      }
    , { "src": "img/run/run.gif"
      , "verb": "бежа́ть"
      }
    , { "src": "img/run/runners.gif"
      , "verb": "бежа́ть"
      }

      // лететь
    , { "src": "img/fly/bat.gif"
      , "verb": "лете́ть"
      }
    , { "src": "img/fly/butterfly.gif"
      , "verb": "лете́ть"
      }
    , { "src": "img/fly/calvin.gif"
      , "verb": "лете́ть"
      }
    , { "src": "img/fly/fly.gif"
      , "verb": "лете́ть"
      }
    , { "src": "img/fly/FlyingFly.gif"
      , "verb": "лете́ть"
      }
    , { "src": "img/fly/frisbee.gif"
      , "verb": "лете́ть"
      }
    , { "src": "img/fly/hawk.gif"
      , "verb": "лете́ть"
      }
    , { "src": "img/fly/helicopter.gif"
      , "verb": "лете́ть"
      }
    , { "src": "img/fly/jet-pack.gif"
      , "verb": "лете́ть"
      }
    , { "src": "img/fly/plane.gif"
      , "verb": "лете́ть"
      }

      // плыть
    , { "src": "img/swim/frigate.gif"
      , "verb": "плыть"
      }
    , { "src": "img/swim/hands.gif"
      , "verb": "плыть"
      }
    , { "src": "img/swim/mermaid.gif"
      , "verb": "плыть"
      }
    , { "src": "img/swim/nouille.gif"
      , "verb": "плыть"
      }
    , { "src": "img/swim/shark.gif"
      , "verb": "плыть"
      }
    , { "src": "img/swim/speedboat.gif"
      , "verb": "плыть"
      }
    , { "src": "img/swim/submarine.gif"
      , "verb": "плыть"
      }
    , { "src": "img/swim/swim.gif"
      , "verb": "плыть"
      }
    , { "src": "img/swim/yacht.gif"
      , "verb": "плыть"
      }
    , { "src": "img/swim/yellowfish.gif"
      , "verb": "плыть"
      }
  ]


  dvi.id = new Id(questionArray)

})(window.dvi)