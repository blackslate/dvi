"use strict"

;(function customCode(dvi){

  if (!dvi) {
    dvi = window.dvi = {}
  }

  class Answers {
    constructor () {
      console.log("constructor")
      this.input = document.querySelector("input[name=answer]")
      this.player = undefined

      let listener = this.check.bind(this)
      this.input.addEventListener("input", listener, true)
    }


    initializeYouTubePlayer() {

      this.player = new YT.Player('ytplayer', {
        height: '360',
        width: '640',
        // videoId: 'M7lc1UVf-VE'
      });
    }


    check(event) {
      let value = event.target.value
      if (value.toLowerCase() === "blank") {
        if (this.player) {
          let options = {
            videoId:          "M7lc1UVf-VE"
          , startSeconds:     2
          , endSeconds:       3
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

          this.player.loadVideoById(options)
        }
      }
    }
  }

  dvi.answers = new Answers()


})(window.dvi)