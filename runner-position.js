let timeStamps = [0,2,6,15]
function calculatePosition(speed,trackLength) {
  let direction = 1
  let position = 0
  for (let i = 0; i < timeStamps.length -1; i++) {
    const runTime = timeStamps[i+1] - timeStamps[i]
    position += runTime * speed * direction
    direction *= (-1)
    if (position > trackLength) {
      position = trackLength
    } else if (position < 0) {
      position = 0
    }
  }
  return(position)
}
