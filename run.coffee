doc = document
Element::on = Element::addEventListener
doc.on = doc.addEventListener
byId = (id) -> doc.getElementById id

attrs = (el,attrs) ->
  for own key, val of attrs
    el.setAttribute key, val
css = (el,attrs) ->
  rules = for own key, val of attrs
    "#{key}:#{val};"
  el.setAttribute "style", (el.getAttribute("style") || "") + rules.join("")

scaleImage = (canvas,maxWidth,maxHeight,image,context) ->
  minRatio = Math.min(maxWidth / image.width, maxHeight / image.height) 
  attrs canvas,
    width: image.width * minRatio
    height: image.height * minRatio
  if minRatio < 1 
    context.scale(minRatio,minRatio) 

images = {}
lastJoined = null
doc.on "DOMContentLoaded", ->


  pols = byId "polaroids"
  shred = byId("shredder")
  fg = byId "fg"

  maxWidth = 200
  maxHeight = 200
  ["shredded-one.jpg","shredded-three.jpg","tokyo.png"].forEach (img) ->
    image = images[img] = new Image() 
    image.src = "img/#{img}"
    image.onload = ->
      pol = doc.createElement "canvas"
      two = pol.getContext("2d")
      back = doc.createElement "div" 
      attrs back,
        class: "polaroid"
        draggable: true
      css back,
        width: maxWidth + "px"
        height: maxHeight + "px"
      
      scaleImage pol, maxWidth, maxHeight, image, two
      two.drawImage image, 0, 0
      back.appendChild pol

  
      back.on "dragend", (e) ->
        e.preventDefault()
      back.on "dragstart", (e) ->
        e.dataTransfer.setData "text/plain", img 
  
      pols.appendChild back

  shred.on "dragover", (e) -> e.preventDefault()
  
  joinImage = (img) ->

    csv = doc.createElement "canvas"
    attrs csv,
      width: img.width
      height: img.height
    ctx = csv.getContext "2d"


    polaroid = doc.createElement "div"
    attrs polaroid,
      class: "polaroid joined"
    css polaroid,
      width: "400px"
      height: "400px"
    joined = doc.createElement "canvas"
    attrs joined,
      width: img.width
      height: img.height
    joinedCtx = joined.getContext("2d")

    ctx.drawImage img, 0, 0
    data = ctx.getImageData 0, 0, img.width, img.height

    for part, offset in deshred data
      width = part[1] - part[0] + 1
      sourceImage = ctx.getImageData(part[0],0,width,img.height)
      joinedCtx.putImageData sourceImage, offset * width, 0

    target = doc.createElement "canvas"
    targetCtx = target.getContext("2d")

    scaleImage target, 400, 400, img, targetCtx
    targetCtx.drawImage joined, 0, 0
  
    ffFix = doc.createElement "div"
    ffFix.appendChild target
    polaroid.appendChild ffFix
    shred.appendChild polaroid
    polaroid.onclick = -> 
      polaroid.parentNode.removeChild(polaroid)
    setTimeout ->
      polaroid.setAttribute "class", "polaroid joined animate"
    , 25

    lastJoined = polaroid


  shred.on "drop", (e) ->

    e.preventDefault()
    
    if lastJoined
      lastJoined.parentNode?.removeChild(lastJoined)

    console.log "heard drop"
    fg.setAttribute "class", "fg on"

    if e.dataTransfer.files.length > 0
      file = e.dataTransfer.files[0]
      reader = new FileReader
      reader.onload = (file) ->
        img = new Image
        img.src = file.target.result
        img.onload = ->
          joinImage img
          setTimeout ->
            fg.setAttribute "class", "fg"
          , 1500

      reader.readAsDataURL(file)
    else
      joinImage images[e.dataTransfer.getData "text/plain"]
      setTimeout ->
        fg.setAttribute "class", "fg"
      , 1500
       
