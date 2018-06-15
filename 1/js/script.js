"use strict"

;(function gifLoaded(dvi){

  if (!dvi) {
    dvi = window.dvi = {}
  }


  class Cell {
    constructor(parentElement, callback) {
      this.parentElement = parentElement
      this.callback = callback

      // Placeholders included here for reference
      this.element = undefined // canvas or GIF image
      this.context = undefined
      this.options = {}
      this.verbs = []
      this.height = 0
      this.width = 0
      this.left = 0
      this.right = 0

      // Events
      let listener = this.treatClick.bind(this)
      this.parentElement.addEventListener("mousedown", listener, true)

      listener = this.toggleAnimation.bind(this)
      this.parentElement.addEventListener("mouseenter", listener, true)
      this.parentElement.addEventListener("mouseleave", listener, true)
      
      // GIF placeholder
      this.image = document.createElement("img")

      // Play Arrow SVG
      this.svg = this._createSVG()

      // Canvas
      let rect = parentElement.getBoundingClientRect()
      this.size = rect.width
      this.canvasElement = this._createCanvas()

      // p element for phrase
      this.legend = this._createLegend()

      this._setElement(this.canvasElement)
    }


    // EVENTS // EVENTS // EVENTS // EVENTS // EVENTS // EVENTS //

    treatClick(event) {
      this.callback(this)
    }


    treatLoadedImage(event) {
      if (event.type === "error") {
        // TODO: get a new image?
        return console.log(event)
      }

      this._setDimensionsToFit()
      this._createStillImage()
      this._toggleGrayscale(false)

      // this._setElement(this.image, true)
    }

    // PUBLIC METHODS // PUBLIC METHODS // PUBLIC METHODS //

    setImage(options) {
      this.options = options || {}
      this.verbs = options.verbs

      let listener = this.treatLoadedImage.bind(this)
      this.image.onload = listener
      this.image.onerror = listener

      this.image.src = this.options.src

      this.legend.innerText = this.options.phrase
    }


    treatLoadedImage(event) {
      if (event.type === "error") {
        // TODO: get a new image?
        return console.log(event)
      }

      this._setDimensionsToFit()
      this._createStillImage()
      this._toggleGrayscale(false)

      // this._setElement(this.image, true)
    }


    toggleAnimation(event) {
      if (event.type === "mouseenter") {
        this._setElement(this.image, "noPlayArrow")
      } else {
        this._setElement(this.canvasElement)
      }
    }


    showError() {
      this._toggleGrayscale(true)
    }


    showCorrect() {

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

      if (!noPlayArrow) {
        this.parentElement.appendChild(this.svg)
      } else {
        element.style = "width:" + this.width +"px;"
                      + "height:" + this.height + "px;"
                      + "left:" + this.left + "px;"
                      + "position: relative;"

      }

      this.parentElement.appendChild(this.legend)
    }


    _setDimensionsToFit() {
      let width = this.image.width
      let height = this.image.height
      // console.log(this.src, width, height)

      let ratio = Math.min(this.size / width
                         , this.size / height)
      this.width = (width *= ratio)
      this.height = (height *= ratio)

      this.left = (this.size - width) / 2
      this.top = (this.size - height) / 2
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
    }


    _toggleGrayscale(toGray) {
      if (toGray) {
        this.parentElement.classList.add("grayscale")
      } else {
        this.parentElement.classList.remove("grayscale")
      }
    }


    _showPhrase() {

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
      console.log(this.map)

      this.verbs = Object.keys(this.map)
      console.log(this.verbs)
    }


    _getQuestionMap(array) {
      let map = {}

      array.forEach(addToMap)

      return map

      function addToMap(imageData) {
        // { "src": "img/walk/duck.gif"
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
          // Get the next image  daha for this verb...
          imageData = imageSource.pop()

          // ... and reinsert it more than halfway down the list
          let halfLength = Math.ceil(imageSource.length / 2)
          let index = Math.floor(Math.random() * halfLength) + halfLength
          // if imageSource.length is odd, index may be greater than
          // imageSource.length, in which case splice() will simply  
          // add imageData at the very end.
          imageSource.splice(index, 0, imageData)

          // Check that the image does not (also) illustrate the cue
          // verb
          // 
          if (!cue) {
            cue = verb
            found = true
          } else if (imageData.verbs.indexOf(cue) < 0) {
            found = true
          }
        }

        return imageData
      }


      for ( let ii = 0; ii < 4; ii += 1 ) {
        // Choose a verb that has not yet been chosen...
        let index = Math.floor(Math.random() * max)
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
      console.log(pool)

      return pool
    }
  }


  class Controller {
    constructor(model) {
      // this.setPool = model.setQuestionPool.bind(model)
      this.getNext = model.getNext.bind(model)

      let listener = this.checkAnswer.bind(this)
      let query = "div.cell"
      let createCell = (cellElement, index) => {
        this.cells[index] = new Cell(cellElement, listener)
      }

      this.cueElement = document.querySelector("p.cue")
      this.cells = [].slice.call(document.querySelectorAll(query))
      this.cells.forEach(createCell)

      this.nextPressed()
    }


    checkAnswer(verbs) {
      let wrong = verbs.indexOf(this.cue) < 0
      return !wrong
    }


    nextPressed(event) {
      let pool = this.getNext()

      this.cue = pool.cue
      let _displayImage = this._displayImage.bind(this)

      pool.forEach(_displayImage)
      this.cueElement.innerText = this.cue
    }


    _displayImage(imageData, index) {
      let cell = this.cells[index]
      cell.setImage(imageData)
    }
  }


  class Gif {
    constructor (questionArray) {
      let model = new Model(questionArray)
      this.controller = new Controller(model)
    }
  }


  let questionArray = [
    { "src": "img/walk/dog.gif"
      , "verbs": ["идти́"]
      , "phrase": "XXX"
      , "audio": "audio/walk/dog.mp3"
      }
    , { "src": "img/walk/duck.gif"
      , "verbs": ["идти́"]
      , "phrase": "XXX"
      , "audio": "audio/walk/duck.mp3"
      }
    , { "src": "img/walk/fassbender.gif"
      , "verbs": ["идти́"]
      , "phrase": "XXX"
      , "audio": "audio/walk/fassbender.mp3"
      }
    , { "src": "img/walk/flamingos.gif"
      , "verbs": ["идти́"]
      , "phrase": "XXX"
      , "audio": "audio/walk/flamingos.mp3"
      }
    , { "src": "img/walk/penguin.gif"
      , "verbs": ["идти́"]
      , "phrase": "XXX"
      , "audio": "audio/walk/penguin.mp3"
      }
    , { "src": "img/walk/pug.gif"
      , "verbs": ["идти́"]
      , "phrase": "XXX"
      , "audio": "audio/walk/pug.mp3"
      }
    , { "src": "img/walk/robot.gif"
      , "verbs": ["идти́"]
      , "phrase": "XXX"
      , "audio": "audio/walk/robot.mp3"
      }
    , { "src": "img/walk/walk.gif"
      , "verbs": ["идти́"]
      , "phrase": "XXX"
      , "audio": "audio/walk/walk.mp3"
      }
    , { "src": "img/walk/walking.gif"
      , "verbs": ["идти́"]
      , "phrase": "XXX"
      , "audio": "audio/walk/walking.mp3"
      }
    , { "src": "img/walk/woman.gif"
      , "verbs": ["идти́"]
      , "phrase": "XXX"
      , "audio": "audio/walk/woman.mp3"
      }

      // ехать
    , { "src": "img/drive/cyclist.gif"
      , "verbs": ["е́хать"]
      , "phrase": "XXX"
      , "audio": "audio/drive/cyclist.mp3"
      }
    , { "src": "img/drive/desertCar.gif"
      , "verbs": ["е́хать"]
      , "phrase": "XXX"
      , "audio": "audio/drive/desertCar.mp3"
      }
    , { "src": "img/drive/dogBike.gif"
      , "verbs": ["е́хать"]
      , "phrase": "XXX"
      , "audio": "audio/drive/dogBike.mp3"
      }
    , { "src": "img/drive/dogCart.gif"
      , "verbs": ["е́хать"]
      , "phrase": "XXX"
      , "audio": "audio/drive/dogCart.mp3"
      }
    , { "src": "img/drive/horse.gif"
      , "verbs": ["е́хать", "бежа́ть"] // also бежа́ть
      , "phrase": "XXX"
      , "audio": "audio/drive/horse.mp3"
      }
    , { "src": "img/drive/metro.gif"
      , "verbs": ["е́хать"]
      , "phrase": "XXX"
      , "audio": "audio/drive/metro.mp3"
      }
    , { "src": "img/drive/skateboard.gif"
      , "verbs": ["е́хать"]
      , "phrase": "XXX"
      , "audio": "audio/drive/skateboard.mp3"
      }
    , { "src": "img/drive/skates.gif"
      , "verbs": ["е́хать"]
      , "phrase": "XXX"
      , "audio": "audio/drive/skates.mp3"
      }
    , { "src": "img/drive/train.gif"
      , "verbs": ["е́хать"]
      , "phrase": "XXX"
      , "audio": "audio/drive/train.mp3"
      }
    , { "src": "img/drive/trucks.gif"
      , "verbs": ["е́хать"]
      , "phrase": "грузовики идут, человек едет"
      , "audio": "audio/drive/trucks.mp3"
      }

      // бежать
    , { "src": "img/run/bird.gif"
      , "verbs": ["бежа́ть"]
      , "phrase": "XXX"
      , "audio": "audio/run/bird.mp3"
      }
    , { "src": "img/run/cartoon.gif"
      , "verbs": ["бежа́ть"]
      , "phrase": "XXX"
      , "audio": "audio/run/cartoon.mp3"
      }
    , { "src": "img/run/cat.gif"
      , "verbs": ["бежа́ть"]
      , "phrase": "XXX"
      , "audio": "audio/run/cat.mp3"
      }
    , { "src": "img/run/chaplin.gif"
      , "verbs": ["бежа́ть"]
      , "phrase": "XXX"
      , "audio": "audio/run/chaplin.mp3"
      }
    , { "src": "img/run/daschund.gif"
      , "verbs": ["бежа́ть"]
      , "phrase": "XXX"
      , "audio": "audio/run/daschund.mp3"
      }
    , { "src": "img/run/dog.gif"
      , "verbs": ["бежа́ть"]
      , "phrase": "XXX"
      , "audio": "audio/run/dog.mp3"
      }
    , { "src": "img/run/dogInPool.gif"
      , "verbs": ["бежа́ть"]
      , "phrase": "XXX"
      , "audio": "audio/run/dogInPool.mp3"
      }
    , { "src": "img/run/jesus.gif"
      , "verbs": ["бежа́ть"]
      , "phrase": "XXX"
      , "audio": "audio/run/jesus.mp3"
      }
    , { "src": "img/run/run.gif"
      , "verbs": ["бежа́ть"]
      , "phrase": "XXX"
      , "audio": "audio/run/run.mp3"
      }
    , { "src": "img/run/runners.gif"
      , "verbs": ["бежа́ть"]
      , "phrase": "XXX"
      , "audio": "audio/run/runners.mp3"
      }

      // лететь
    , { "src": "img/fly/bat.gif"
      , "verbs": ["лете́ть"]
      , "phrase": "XXX"
      , "audio": "audio/fly/bat.mp3"
      }
    , { "src": "img/fly/butterfly.gif"
      , "verbs": ["лете́ть"]
      , "phrase": "XXX"
      , "audio": "audio/fly/butterfly.mp3"
      }
    , { "src": "img/fly/calvin.gif"
      , "verbs": ["лете́ть"]
      , "phrase": "XXX"
      , "audio": "audio/fly/calvin.mp3"
      }
    , { "src": "img/fly/fly.gif"
      , "verbs": ["лете́ть"]
      , "phrase": "XXX"
      , "audio": "audio/fly/fly.mp3"
      }
    , { "src": "img/fly/FlyingFly.gif"
      , "verbs": ["лете́ть"]
      , "phrase": "XXX"
      , "audio": "audio/fly/FlyingFly.mp3"
      }
    , { "src": "img/fly/frisbee.gif"
      , "verbs": ["лете́ть"]
      , "phrase": "XXX"
      , "audio": "audio/fly/frisbee.mp3"
      }
    , { "src": "img/fly/hawk.gif"
      , "verbs": ["лете́ть"]
      , "phrase": "XXX"
      , "audio": "audio/fly/hawk.mp3"
      }
    , { "src": "img/fly/helicopter.gif"
      , "verbs": ["лете́ть"]
      , "phrase": "XXX"
      , "audio": "audio/fly/helicopter.mp3"
      }
    , { "src": "img/fly/jet-pack.gif"
      , "verbs": ["лете́ть"]
      , "phrase": "XXX"
      , "audio": "audio/fly/jet-pack.mp3"
      }
    , { "src": "img/fly/plane.gif"
      , "verbs": ["лете́ть"]
      , "phrase": "XXX"
      , "audio": "audio/fly/plane.mp3"
      }

      // плыть
    , { "src": "img/swim/frigate.gif"
      , "verbs": ["плыть"]
      , "phrase": "XXX"
      , "audio": "audio/swim/frigate.mp3"
      }
    , { "src": "img/swim/hands.gif"
      , "verbs": ["плыть"]
      , "phrase": "XXX"
      , "audio": "audio/swim/hands.mp3"
      }
    , { "src": "img/swim/mermaid.gif"
      , "verbs": ["плыть"]
      , "phrase": "XXX"
      , "audio": "audio/swim/mermaid.mp3"
      }
    , { "src": "img/swim/nouille.gif"
      , "verbs": ["плыть"]
      , "phrase": "XXX"
      , "audio": "audio/swim/nouille.mp3"
      }
    , { "src": "img/swim/shark.gif"
      , "verbs": ["плыть"]
      , "phrase": "XXX"
      , "audio": "audio/swim/shark.mp3"
      }
    , { "src": "img/swim/speedboat.gif"
      , "verbs": ["плыть"]
      , "phrase": "XXX"
      , "audio": "audio/swim/speedboat.mp3"
      }
    , { "src": "img/swim/submarine.gif"
      , "verbs": ["плыть"]
      , "phrase": "XXX"
      , "audio": "audio/swim/submarine.mp3"
      }
    , { "src": "img/swim/swim.gif"
      , "verbs": ["плыть"]
      , "phrase": "XXX"
      , "audio": "audio/swim/swim.mp3"
      }
    , { "src": "img/swim/yacht.gif"
      , "verbs": ["плыть"]
      , "phrase": "XXX"
      , "audio": "audio/swim/yacht.mp3"
      }
    , { "src": "img/swim/yellowfish.gif"
      , "verbs": ["плыть"]
      , "phrase": "XXX"
      , "audio": "audio/swim/yellowfish.mp3"
      }
  ]


  dvi.gif = new Gif(questionArray)

})(window.dvi)