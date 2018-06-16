"use strict"

;(function gifLoaded(dvi){

  if (!dvi) {
    dvi = window.dvi = {}
  }


  function shuffle(array) {
    var j, x, i;

    for (i = array.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = array[i];
      array[i] = array[j];
      array[j] = x;
    }

    return array
  }


  class AudioPlayer {
    constructor (callback, regex) {
      this.callback = callback
      this.regex = regex
      this.audio = new Audio()

      let listener = this._audioLoaded.bind(this)
      this.audio.addEventListener("canplaythrough", listener, true)
      this.audio.addEventListener("error", listener, true)
      this.audio.onerror = listener

      this.noCallbackArray = []

      listener = this._audioEnded.bind(this)
      this.audio.onended = listener
    }


    play(src, options = {}) {
      // this.noCallback = !!noCallback
      switch (options.callback) {
        case "never":
          if (this.noCallbackArray.indexOf(src) < 0) {
            this.noCallbackArray.push(src)
          }
        break
        case false:
          this.noCallback = true
      }

      this.audio.src = src
      // console.log("play", src)
      // this.audio.play()
    }


    stop() {
      this.audio.pause()
      this.audio.currentTime = 0
      this.audio.src = ""
    }


    _audioLoaded(event) {
      // console.log(event.type)

      if (event.type === "error") {
        return console.log("ERROR:", event)
      }

      this.audio.play()
    } 


    _audioEnded (event) {
      if (!this.noCallback) {
        let src = decodeURI(event.target.src.match(this.regex)[0])
        this.noCallback = !(this.noCallbackArray.indexOf(src) < 0)
      }

      if (!this.noCallback) {
        this.callback("next")
      }

      this.noCallback = false
    }
  }


  class Cell {
    constructor(parentElement, callback) {
      this.parentElement = parentElement
      this.callback = callback

      // Placeholders included here for reference
      this.element = null // canvas or GIF image
      this.context = null
      this.options = {}
      this.verbs = []
      this.height = 0
      this.width = 0
      this.left = 0
      this.right = 0
      this.clicked = false

      // Events
      let listener = this.treatClick.bind(this)
      this.parentElement.addEventListener("mousedown", listener, true)

      listener = this.toggleAnimation.bind(this)
      this.parentElement.addEventListener("mouseenter", listener, true)
      this.parentElement.addEventListener("mouseleave", listener, true)
      
      // GIF placeholder
      this.image = document.createElement("img")

      listener = this.treatLoadedImage.bind(this)
      this.image.onload = listener
      this.image.onerror = listener

      // Play Arrow SVG
      this.svg = this._createSVG()

      // Canvas
      let rect = parentElement.getBoundingClientRect()
      this.size = rect.width
      this.canvasElement = this._createCanvas()

      // p element for phrase
      this.legend = this._createLegend()
      listener = this.playLegend.bind(this)
      this.legend.addEventListener("mouseup", listener, true)
    }


    // EVENTS // EVENTS // EVENTS // EVENTS // EVENTS // EVENTS //

    treatClick(event) {
      this.clicked = true
      this.element.style = ""

      let correct = this.callback("check", this.verbs)

      if (correct) {
        this._showCorrect()
      } else {
        this._showError()
      }
    }


    treatLoadedImage(event) {
      if (event.type === "error") {
        // TODO: get a new image?
        return console.log(event)
      }

      // console.log("load", event.target.src, event.target.width, event.target.height)
      this._setDimensionsToFit()
      this._createStillImage()
      this._toggleGrayscale(false)
      this.parentElement.classList.remove("correct") //, "grayscale")
    }


    playLegend(event) {
      this.callback("play", this.options.audio)
    }
    

    // PUBLIC METHODS // PUBLIC METHODS // PUBLIC METHODS //

    setImage(options) {
      this.options = options
      this.verbs = options.verbs

      this.image.src = this.options.src
      this.image.removeAttribute("style")
      this.image.removeAttribute("class")

      this.canvasElement.removeAttribute("style")
      this.canvasElement.removeAttribute("class")

      this.clicked = false
      this._setElement(this.canvasElement)

      this.legend.innerHTML = this.options.phrase

      let background = options.background
      if (background) {
        this.parentElement.style = "background-color:"+background+";"
      } else {
        this.parentElement.removeAttribute("style")
      }
    }


    toggleAnimation(event) {
      // // IF PLAYBACK AFTER ERROR IS NOT TO BE PERMITTED, CHANGE THE
      // // CSS RULE FOR div.grayscale svg { }
      if (event.target.nodeName.toUpperCase() !== "SVG") {
        return
      }
    
      let animate = event && event.type === "mouseenter"

      if (animate) {
        this._startAnimation()
      } else {
        this._stopAnimation()
      }
    }


    // PRIVATE METHODS // PRIVATE METHODS // PRIVATE METHODS //

    _createSVG() {
      let svgns = "http://www.w3.org/2000/svg"
      let xlinkns = "http://www.w3.org/1999/xlink"
      let svg = document.createElementNS(svgns, "svg")
      
      svg.setAttribute("viewBox", "0 0 100 100")
      svg.setAttribute("width", "50")
      svg.setAttribute("height", "50")
      
      let use = document.createElementNS(svgns, "use")
      use.setAttributeNS(xlinkns, "href", "#play");

      svg.appendChild(use)

      return svg
    }


    _createCanvas() {
      let canvas = document.createElement("canvas")
      canvas.width = this.size
      canvas.height = this.size

      let ctx = this.context = canvas.getContext("2d")

      ctx.beginPath();
      ctx.moveTo(10, 10)
      ctx.lineTo(310, 10)
      ctx.lineTo(310, 310)
      ctx.lineTo(10, 310)
      ctx.closePath()

      ctx.stroke()
      ctx.fillStyle = '#fff'
      ctx.fill()

      return canvas
    }


    _createLegend() {
      let p = document.createElement("p")
      p.classList.add("legend")

      return p
    }


    _setElement(element, noPlayArrow) {
      this._empty()
      this.element = element
      this.parentElement.appendChild(element)
      this.parentElement.appendChild(this.svg)

      if (!noPlayArrow) {
        this.svg.classList.remove("invisible")
      } else {
        this.svg.classList.add("invisible")
      }

      if (element.nodeName === "IMG") {
        element.style = "width:" + this.width +"px;"
                      + "height:" + this.height + "px;"
                      + "left:" + this.left + "px;"
                      + "position: relative;"

      }

      if (this.clicked) {
        this._showPhrase()
      }
    }


    _setDimensionsToFit() {
      let image = document.createElement("img")
      image.src = this.image.src
      let width = image.width
      let height = image.height

      let ratio = Math.min(this.size / width
                         , this.size / height)
      this.width = (width *= ratio)
      this.height = (height *= ratio)

      this.left = (this.size - width) / 2
      this.top = (this.size - height) / 2

      // console.log("fit ", this.image.src, ratio, width, height)
    }


    _createStillImage() {
      this.context.clearRect(0, 0, this.size, this.size)
      this.context.drawImage(
        this.image  // image
      , this.left   // dx
      , this.top    // dy
      , this.width  // dWidth
      , this.height // dHeight
      )

      // console.log("img ", this.width, this.height, this.left, this.top)
      // console.log("***")
    }


    _startAnimation() {
      this._setElement(this.image, "hidePlayArrow")
    }


    _stopAnimation(hidePlayArrow) {
      this._setElement(this.canvasElement, hidePlayArrow)
    }


    _showError() {
      this._toggleGrayscale(true)
      this._stopAnimation(true)
    }


    _showCorrect() {
      this._startAnimation()
      this.parentElement.classList.add("correct")

      this.element.style = "width:" + this.width * 2 +"px;"
                         + "height:" + this.height * 2 + "px;"
                         + "left:" + this.left * 2 + "px;"
                         // + "top:" + this.top * 2 + "px;"
                         + "position: relative;"
      this._showPhrase()

      this.callback("reward", this.options.audio)
    }


    _toggleGrayscale(toGray) {
      if (toGray) {
        if (this.options.setToBlack) {
          this.parentElement.removeAttribute("style")
        }
        this.parentElement.classList.add("grayscale")

      } else {
        this.parentElement.classList.remove("grayscale")
      }
    }


    _showPhrase() {
      this.parentElement.appendChild(this.legend)
    }


    _empty() {
      let child
      while (child = this.parentElement.lastChild) {
        this.parentElement.removeChild(child)
      }
    }
  }


  class Model {
    constructor (questionArray) {
      this.map = this._getQuestionMap(questionArray)
      // console.log(this.map)

      this.verbs = Object.keys(this.map)
      // console.log(this.verbs)
    }


    _getQuestionMap(array) {
      let map = {}

      shuffle(array)
      array.forEach(addToMap)

      return map

      function addToMap(imageData) {
        // { "src": "../shared/img/walk/duck.gif"
        // , "verbs": ["идти́"]
        // , "phrase": "XXX"
        // , "audio": "audio/walk/duck.mp3"
        // }

        imageData.verbs.forEach(addToVerbArray)

        function addToVerbArray(verb) {
          let verbArray = map[verb]

          if (!verbArray) {
            verbArray = []
            map[verb] = verbArray
          }

          verbArray.push(imageData)
        }
      }
    }


    getNext() {
      // Renew the entire stock in the pool
      let pool = []
      let max = this.verbs.length
      let cue = undefined

      let getImageData = (verb) => {
        let imageSource = this.map[verb]
        let found = false
        let imageData

        while (!found) {
          // Get the next image data for this verb...
          imageData = imageSource.pop()

          // ... and reinsert it less than halfway down the list
          let halfLength = Math.ceil(imageSource.length / 2)
          let index = Math.floor(Math.random() * halfLength)
          // if imageSource.length is odd, index may be greater than
          // imageSource.length, in which case splice() will simply  
          // add imageData at the very end.
          imageSource.splice(index, 0, imageData)

          // Check that the image does not (also) illustrate the cue
          // verb, and that it has not already been chosen

          if (!cue) {
            cue = verb
            found = true
          } else if (imageData.verbs.indexOf(cue) < 0) { // not cue
            if (pool.indexOf(imageData) < 0) { // not already chosen
              found = true
            }
          }
        }

        return imageData
      }


      for ( let ii = 0; ii < 4; ii += 1 ) {
        // Choose a verb that has not yet been chosen...
        let index = Math.floor(Math.random() * max)

        // HACK to prevent the same cue verb appearing twice in a row
        // The previously chosen verb will always have index === 1
        if (!ii && index === 1) {
          index = Math.floor(Math.random() * 4)
          index = index ? index + 1 : index // 0 .. 2, 3, 4
        }

        let verb = this.verbs.splice(index, 1)[0]
        // ... and return it to the end of the list so it won't be
        // chosen again
        this.verbs.push(verb)
        max -= 1 

        let imageData = getImageData(verb)
        index = Math.floor(Math.random() * (pool.length + 1))
        pool.splice(index, 0, imageData)

        // console.log(verb)
        // console.log(imageData)
      }

      // console.log(this.verbs)
      pool.cue = cue
      // console.log(pool)

      return pool
    }
  }


  class Controller {
    constructor(model) {
      let listener = this.interface.bind(this)

      let createCell = (cellElement, index) => {
        this.cells[index] = new Cell(cellElement, listener)
      }

      let regex = /audio\/[^.]+.mp3/
      this.audioFolder = "audio/"

      this.audio = new AudioPlayer(listener, regex)
      this.getNext = model.getNext.bind(model)

      this.cueElement = document.querySelector("span.cue")
      this.cells = [].slice.call(document.querySelectorAll("div.cell"))
      this.cells.forEach(createCell)

      listener = this.playCue.bind(this)
      this.cueElement.addEventListener("mouseup", listener, true)

      this.auto = false
      this.checkbox = document.querySelector("input")
      let element = document.querySelector("div.checkbox")
      listener = this.toggleAuto.bind(this)
      element.addEventListener("change", listener, true)

      this.manual = document.querySelector("i.manual")
      listener = this.nextItem.bind(this)
      this.manual.addEventListener("mouseup", listener, true)

      this.nextItem()
    }


    interface(action, item) {
      switch (action) {
        case "check":
          let wrong = item.indexOf(this.cue) < 0

          return !wrong

        case "play":
          this.audio.play(item, { callback: false })
        break

        case "reward":
          this.audio.play(item, { callback: this.auto })
          this.toggleNext(true)
        break

        case "next":
          this.nextItem()
      }
    }


    nextItem() {
      this.audio.stop()
      let pool = this.getNext()

      this.cue = pool.cue
      let _displayImage = this._displayImage.bind(this)

      pool.forEach(_displayImage)
      this.cueElement.innerText = this.cue

      this.toggleNext(false)
      this.playCue()
    }


    playCue() {
      let fileName = this.cue.replace("́", "")
      let audioPath = this.audioFolder + fileName + ".mp3"
      this.audio.play(audioPath, { callback: "never" })
    }


    toggleAuto() {
      let auto = this.auto = this.checkbox.checked
      if (auto) {
        this.manual.classList.add("active")
      } else {
        this.manual.classList.remove("active") 
      }
    }


    toggleNext(enabled) {
      if (enabled) {
        this.manual.classList.remove("disabled")
      } else {
        this.manual.classList.add("disabled")
      }
    }


    _displayImage(imageData, index) {
      let cell = this.cells[index]
      cell.setImage(imageData)
    }
  }


  class Gif {
    constructor (questionArray,) {
      let model = new Model(questionArray)
      let audio = new Audio()
      this.controller = new Controller(model, audio)
    }
  }


  let questionArray = [
    { "src": "../shared/img/walk/dog.gif"
      , "verbs": ["идти́"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // walk/dog.mp3"
      }
    , { "src": "../shared/img/walk/duck.gif"
      , "verbs": ["идти́"]
      , "phrase": "XXX"
      , "background": "#43525a"
      , "setToBlack": true
      , "audio": "audio/placeholder.mp3" // walk/duck.mp3"
      }
    , { "src": "../shared/img/walk/fassbender.gif"
      , "verbs": ["идти́"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // walk/fassbender.mp3"
      }
    , { "src": "../shared/img/walk/flamingos.gif"
      , "verbs": ["идти́"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // walk/flamingos.mp3"
      }
    , { "src": "../shared/img/walk/penguin.gif"
      , "verbs": ["идти́"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // walk/penguin.mp3"
      }
    , { "src": "../shared/img/walk/pug.gif"
      , "verbs": ["идти́"]
      , "phrase": "XXX"
      , "background": "#fff"
      , "audio": "audio/placeholder.mp3" // walk/pug.mp3"
      }
    , { "src": "../shared/img/walk/robot.gif"
      , "verbs": ["идти́"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // walk/robot.mp3"
      }
    , { "src": "../shared/img/walk/walk.gif"
      , "verbs": ["идти́"]
      , "phrase": "персонаж идет"
      , "background": "#fff"
      , "audio": "audio/placeholder.mp3" // walk/walk.mp3"
      }
    , { "src": "../shared/img/walk/walking.gif"
      , "verbs": ["идти́"]
      , "phrase": "XXX"
      , "background": "#fff"
      , "audio": "audio/placeholder.mp3" // walk/walking.mp3"
      }
    , { "src": "../shared/img/walk/woman.gif"
      , "verbs": ["идти́"]
      , "phrase": "женщина <span>идет</span>"
      , "background": "#fff"
      , "audio": "audio/placeholder.mp3" // walk/woman.mp3"
      }

      // ехать
    , { "src": "../shared/img/drive/cyclist.gif"
      , "verbs": ["е́хать"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // drive/cyclist.mp3"
      }
    , { "src": "../shared/img/drive/desertCar.gif"
      , "verbs": ["е́хать"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // drive/desertCar.mp3"
      }
    , { "src": "../shared/img/drive/dogBike.gif"
      , "verbs": ["е́хать"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // drive/dogBike.mp3"
      }
    , { "src": "../shared/img/drive/dogCart.gif"
      , "verbs": ["е́хать"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // drive/dogCart.mp3"
      }
    , { "src": "../shared/img/drive/horse.gif"
      , "verbs": ["е́хать", "бежа́ть"] // also бежа́ть
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // drive/horse.mp3"
      }
    , { "src": "../shared/img/drive/metro.gif"
      , "verbs": ["е́хать"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // drive/metro.mp3"
      }
    , { "src": "../shared/img/drive/skateboard.gif"
      , "verbs": ["е́хать"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // drive/skateboard.mp3"
      }
    , { "src": "../shared/img/drive/skates.gif"
      , "verbs": ["е́хать"]
      , "phrase": "XXX"
      , "background": "#aeddc4"
      , "setToBlack": true
      , "audio": "audio/placeholder.mp3" // drive/skates.mp3"
      }
    , { "src": "../shared/img/drive/train.gif"
      , "verbs": ["е́хать"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // drive/train.mp3"
      }
    , { "src": "../shared/img/drive/trucks.gif"
      , "verbs": ["е́хать"]
      , "phrase": "грузовики <span>едут</span>, человек <span>едет</span>"
      , "audio": "audio/placeholder.mp3" // drive/trucks.mp3"
      }

      // бежать
    , { "src": "../shared/img/run/batman.gif"
      , "verbs": ["бежа́ть"]
      , "phrase": "XXX"
      , "background": "#ff9c0a"
      , "setToBlack": true
      , "audio": "audio/placeholder.mp3" // run/batman.mp3"
      }    , { "src": "../shared/img/run/bird.gif"
      , "verbs": ["бежа́ть"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // run/bird.mp3"
      }
    , { "src": "../shared/img/run/cartoon.gif"
      , "verbs": ["бежа́ть"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // run/cartoon.mp3"
      }
    , { "src": "../shared/img/run/cat.gif"
      , "verbs": ["бежа́ть"]
      , "phrase": "XXX"
      , "background": "#fff"
      , "audio": "audio/placeholder.mp3" // run/cat.mp3"
      }
    , { "src": "../shared/img/run/chaplin.gif"
      , "verbs": ["бежа́ть"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // run/chaplin.mp3"
      }
    , { "src": "../shared/img/run/daschund.gif"
      , "verbs": ["бежа́ть"]
      , "phrase": "XXX"
      , "background": "#94bab4"
      , "setToBlack": true
      , "audio": "audio/placeholder.mp3" // run/daschund.mp3"
      }
    , { "src": "../shared/img/run/dog.gif"
      , "verbs": ["бежа́ть"]
      , "phrase": "XXX"
      , "background": "#fff"
      , "audio": "audio/placeholder.mp3" // run/dog.mp3"
      }
    , { "src": "../shared/img/run/dogInPool.gif"
      , "verbs": ["бежа́ть"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // run/dogInPool.mp3"
      }
    , { "src": "../shared/img/run/jesus.gif"
      , "verbs": ["бежа́ть"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // run/jesus.mp3"
      }
    , { "src": "../shared/img/run/runners.gif"
      , "verbs": ["бежа́ть"]
      , "phrase": "люди <span>бегут</span>"
      , "background": "#b9e888"
      , "setToBlack": true
      , "audio": "audio/placeholder.mp3" // run/runners.mp3"
      }

      // лететь
    , { "src": "../shared/img/fly/bat.gif"
      , "verbs": ["лете́ть"]
      , "phrase": "XXX"
      , "background": "#fff"
      , "audio": "audio/placeholder.mp3" // fly/bat.mp3"
      }
    , { "src": "../shared/img/fly/butterfly.gif"
      , "verbs": ["лете́ть"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // fly/butterfly.mp3"
      }
    , { "src": "../shared/img/fly/calvin.gif"
      , "verbs": ["лете́ть"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // fly/calvin.mp3"
      }
    , { "src": "../shared/img/fly/fly.gif"
      , "verbs": ["лете́ть"]
      , "phrase": "XXX"
      , "background": "#fff"
      , "audio": "audio/placeholder.mp3" // fly/fly.mp3"
      }
    , { "src": "../shared/img/fly/frisbee.gif"
      , "verbs": ["лете́ть"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // fly/frisbee.mp3"
      }
    , { "src": "../shared/img/fly/hawk.gif"
      , "verbs": ["лете́ть"]
      , "phrase": "XXX"
      , "background": "#fff"
      , "audio": "audio/placeholder.mp3" // fly/hawk.mp3"
      }
    , { "src": "../shared/img/fly/helicopter.gif"
      , "verbs": ["лете́ть"]
      , "phrase": "XXX"
      , "background": "#fff"
      , "audio": "audio/placeholder.mp3" // fly/helicopter.mp3"
      }
    , { "src": "../shared/img/fly/jet-pack.gif"
      , "verbs": ["лете́ть"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // fly/jet-pack.mp3"
      }
    , { "src": "../shared/img/fly/kites.gif"
      , "verbs": ["лете́ть"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // fly/kites.mp3"
      }
    , { "src": "../shared/img/fly/plane.gif"
      , "verbs": ["лете́ть"]
      , "phrase": "самолет <span>летит</span>"
      , "background": "#a9ebf1"
      , "setToBlack": true
      , "audio": "audio/placeholder.mp3" // fly/plane.mp3"
      }
    , { "src": "../shared/img/fly/unicorn.gif"
      , "verbs": ["лете́ть"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // fly/unicorn.mp3"
      }

      // плыть
    , { "src": "../shared/img/swim/frigate.gif"
      , "verbs": ["плыть"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // swim/frigate.mp3"
      }
    // , { "src": "../shared/img/swim/hands.gif"
    //   , "verbs": ["плыть"]
    //   , "phrase": "XXX"
    //   , "audio": "audio/placeholder.mp3" // swim/hands.mp3"
    //   }
    , { "src": "../shared/img/swim/mermaid.gif"
      , "verbs": ["плыть"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // swim/mermaid.mp3"
      }
    , { "src": "../shared/img/swim/nouille.gif"
      , "verbs": ["плыть"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // swim/nouille.mp3"
      }
    , { "src": "../shared/img/swim/shark.gif"
      , "verbs": ["плыть"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // swim/shark.mp3"
      }
    , { "src": "../shared/img/swim/speedboat.gif"
      , "verbs": ["плыть"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // swim/speedboat.mp3"
      }
    , { "src": "../shared/img/swim/submarine.gif"
      , "verbs": ["плыть"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // swim/submarine.mp3"
      }
    , { "src": "../shared/img/swim/swim.gif"
      , "verbs": ["плыть"]
      , "phrase": "XXX"
      , "background": "#fff"
      , "audio": "audio/placeholder.mp3" // swim/swim.mp3"
      }
    , { "src": "../shared/img/swim/yacht.gif"
      , "verbs": ["плыть"]
      , "phrase": "XXX"
      , "audio": "audio/placeholder.mp3" // swim/yacht.mp3"
      }
    , { "src": "../shared/img/swim/yellowfish.gif"
      , "verbs": ["плыть"]
      , "phrase": "рыба <span>плывет</span>"
      , "audio": "audio/placeholder.mp3" // swim/yellowfish.mp3"
      }
  ]


  dvi.gif = new Gif(questionArray)

})(window.dvi)