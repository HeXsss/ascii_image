class Chunk {
  constructor(scene, x, y, ascii) {
    this.scene = scene
    this.x = x
    this.y = y
    const { r, g, b, a } = ascii
    this.ascii = String.fromCharCode(Math.floor((r + g + b + a) / 4 / 4) + 64)
  }
  draw(ctx) {
    ctx.font = `${this.scene.gap}px sans-serif`
    ctx.fillStyle = "#000"
    ctx.fillText(this.ascii, this.x, this.y)
  }
}

class Scene {
  constructor() {
    // DOM
    this.canvas = document.getElementById("Scene")
    this.ctx = this.canvas.getContext("2d")
    this.fileHandler = document.getElementById("fileHandler")
    this.bufferingInput = document.getElementById("buffering")
    this.bufferingInputlabel = document.getElementById("bufferingLabel")
    // Image handlers
    this.image = new Image()
    this.imageData = []
    this.fileReader = new FileReader()
    this.fileHandler.addEventListener("input", (e) => {
      this.fileReader.readAsDataURL(e.target.files[0])
    })
    this.image.onload = () => {
      this.init(this.ctx)
    }
    this.fileReader.onloadend = (e) => {
      this.image.src = e.target.result
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.gap = 5
      this.bufferingInputlabel.innerHTML = `Pixels per character (${this.gap})`
      this.bufferingInput.value = this.gap
    }
    // Buffers
    this.gap = 5
    this.bufferingInput.addEventListener("input", (e) => {
      this.gap = Number(e.target.value)
      this.bufferingInputlabel.innerHTML = `Pixels per character (${this.gap})`
      this.updatePixels()
    })
    //  Chunks
    this.chunks = []
    // Ticks
    this.#frame()
  }
  init(context) {
    const { width, height } = this.canvas
    // get the top left position of the image
    if (this.image.width > width || this.image.height > height) {
      const scaleWidth = this.image.width / this.image.height
      const scaleHeight = this.image.height / this.image.width
      if (height * scaleWidth <= width) {
        context.drawImage(
          this.image,
          width / 2 - (height * scaleWidth) / 2,
          0,
          height * scaleWidth,
          height
        )
      } else {
        context.drawImage(
          this.image,
          0,
          height / 2 - (width * scaleHeight) / 2,
          width,
          width * scaleHeight
        )
      }
    } else {
      context.drawImage(
        this.image,
        width / 2 - this.image.width / 2,
        height / 2 - this.image.height / 2,
        this.image.width,
        this.image.height
      )
    }
    const { data } = context.getImageData(0, 0, width, height)
    this.imageData = data
    if (!data) return
    this.updatePixels()
  }
  updatePixels() {
    this.chunks = []
    for (let y = 0; y < this.canvas.height; y += this.gap) {
      for (let x = 0; x < this.canvas.width; x += this.gap) {
        const index = (y * this.canvas.width + x) * 4
        const { r, g, b, a } = {
          r: this.imageData[index],
          g: this.imageData[index + 1],
          b: this.imageData[index + 2],
          a: this.imageData[index + 3]
        }
        if (a > 0) {
          this.chunks.push(
            new Chunk(this, x, y, {
              r,
              g,
              b,
              a
            })
          )
        }
      }
    }
  }
  #draw() {
    this.chunks.forEach((chunk) => chunk.draw(this.ctx))
  }
  #frame() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    this.#draw()
    requestAnimationFrame(this.#frame.bind(this))
  }
}

const scene = new Scene()
