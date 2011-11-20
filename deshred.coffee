MIN_SLICE_SIZE = 8
MIN_SLICES = 12

{random,round,min,max,ceil,abs} = Math

distance = (pixelA,pixelB) ->
  pixelA.reduce (sum,val,index) -> 
    sum + abs(val - pixelB[index])
  , 0

mergeRect = ([rectA,rectB]) ->
  components = (rectA.components || [rectA]).concat(rectB.components || [rectB])
  new Rect rectA[0], rectB[1], components

takeMax = (arr,highest = -Infinity,highestAt = -1) ->
  for [memeber,val], index in arr when val > highest
    highest = val
    highestAt = index
  arr[highestAt]

takeMin = (arr,lowest = Infinity,lowestAt = -1) ->
  for [memeber,val], index in arr when val < lowest
    lowest = val
    lowestAt = index
  arr[lowestAt]

pixelAt = (x,y,image) ->
  base = (x * 4) + y * (image.width * 4)
  image.data[base + offset] for offset in [0..2]

total = (samples) -> samples.sum()
bottomQuartile = (samples) -> samples.bottomQuartile().sum()
getDistance = (offsetA,offsetB,image,fn = total) ->
  samples = for y in [0..(image.height - 2)]
    distance(pixelAt(offsetA,y,image), pixelAt(offsetB,y,image))
  fn samples

Array::sum = -> @reduce (sum,v) -> sum + v

Array::bottomQuartile = ->
  @slice(0).sort((a,b) -> (a == b && 0) || (a > b && 1) || -1)
           .slice(0,round (this.length / 2))

Rect = (left,right,@components) ->
  @[0] = left
  @[1] = right

Rect.prototype = new Array()

deshred = (image) ->

  {height, width} = image

  integerMultiples = for multiple in [MIN_SLICE_SIZE..(round width / MIN_SLICES)]
    distancesForMultiple = for offset in [1..(ceil width / multiple)] when offset * multiple < width
      getDistance offset * multiple - 1,offset * multiple, image
    [multiple, distancesForMultiple.sum() / distancesForMultiple.length]

  [offset,_] = takeMax integerMultiples

  console.log "largest differences at #{offset}"

  slices = for current in [0..(width - 1)] by offset
    [current, min(current + offset - 1, width - 1)]

  pairMinimal = (slice = slices.pop()) ->

    return slice if slices.length == 0

    rightDistances = for sliceB in slices
      [sliceB,getDistance(slice[1], sliceB[0], image, bottomQuartile)]
    leftDistances = for sliceB in slices
      [sliceB,getDistance(sliceB[1], slice[0], image, bottomQuartile)]

    [rmin,lmin] = [takeMin(rightDistances), takeMin(leftDistances)]
    right = rmin[1] < lmin[1]
    [partner,_] = if right then rmin else lmin 
    
    slices.splice slices.indexOf(partner), 1

    pairMinimal mergeRect if right then [slice, partner] else [partner,slice]

  pairMinimal().components

