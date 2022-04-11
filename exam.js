const Gpio = require('onoff').Gpio

// Define the GPIO pins for the digits
const D1 = new Gpio(18,  'out')
const D2 = new Gpio(23,  'out')
const D3 = new Gpio(24,  'out')
const D4 = new Gpio(25,  'out')

// Define the GPIO pin for each segment of the 7 segment display
const TM = new Gpio(4,  'out')
const TR = new Gpio(17,  'out')
const BR = new Gpio(27,  'out')
const BM = new Gpio(22,  'out')
const BL = new Gpio(5,  'out')
const TL = new Gpio(6,  'out')
const MM = new Gpio(13,  'out')
const DP = new Gpio(19,  'out')

// Define the GPIO pin for the speaker
const SPEAKER = new Gpio(26,  'out')

// Define the GPIO pin for turning the light on, which indicates a plus or minus change in the number of unfulfilled orders
const LIGHTON = new Gpio(21,  'out')

// Define the GPIO pin for light green (LIGHTPLUS) and light red (LIGHTMINUD)
const LIGHTMINUS = new Gpio(20,  'out')
const LIGHTPLUS = new Gpio(16,  'out')

// A basic array of orders with varying fulfillment statuses
const orders = [['order_1', 'unfulfilled'],['order_1', 'unfulfilled'],['order_2', 'unfulfilled'],['order_3', 'fulfilled'],['order_4', 'unfulfilled'],['order_5', 'fulfilled'],['order_6', 'unfulfilled']]

// Define which of the 7 segments will be turned on to create the given number
const numbers = {
    '0': [MM, DP],
    '1': [TM, BM, BL, TL, MM, DP],
    '2': [TL, BR, DP],
    '3': [TL, BL, DP],
    '4': [TM, BL, BM, DP],
    '5': [TR, BL, DP],
    '6': [TR, DP],
    '7': [TL, BL, BM, MM, DP],
    '8': [DP],
    '9': [BL, DP]
}


// Main function to run
async function run(){

  // Run infinitely
    while(1){

      // Run for 1 second, then refresh the order list
      let running = true
      setTimeout(() => running = false, 1000)
        
      // If this loop has run before, the number will have a value, 
      // if there is a value, it is now the previous amount. Otherwise the previous amount is 0
      let prevAmt = number ? number : 0

      // Filter the array of orders to grab only the unfulfilled orders
        number = orders.filter(e => e[1] === 'unfulfilled').length

        // Display whether the number of orders has changed, and if so,
        // whether it is a positive or negative change
        if(number !== prevAmt){
          LIGHTON.writeSync(1)
            if(number > prevAmt){
              LIGHTPLUS.writeSync(1)
            }else{
              LIGHTMINUS.writeSync(1)
            }
            
          // And beep twice if there is a change
          SPEAKER.writeSync(1)
          await delay(50)
          SPEAKER.writeSync(0)
          await delay(50)
          SPEAKER.writeSync(1)
          await delay(50)
          SPEAKER.writeSync(0)
          await delay(150)
          LIGHTMINUS.writeSync(0)
          LIGHTPLUS.writeSync(0)
          LIGHTON.writeSync(0)
        }

        // For the 1 second the loop is running, display the number. If there is not a number, display 0
        while(running) {
            await light(D1, String(number)[String(number).length - 4] ?  String(number)[String(number).length - 4] : 0)
            await light(D2, String(number)[String(number).length - 3] ?  String(number)[String(number).length - 3] : 0)
            await light(D3, String(number)[String(number).length - 2] ?  String(number)[String(number).length - 2] : 0)
            await light(D4, String(number)[String(number).length - 1] ?  String(number)[String(number).length - 1] : 0)
        }
    }
}



/*******************************************************************************************************/
// The above uses ternary operators, which are just simplified if statements. The syntax is as follows:

//             number.length - 4          ?           number.length - 4         :            0
//           [         ^         ]    [      ]       [         ^       ]   [        ]   [         ]
//           [ if the number has ]    [ then ]       [ print the first ]   [  else  ]   [ print 0 ]
//           [     4 digits      ]                   [ digit.          ] 

/***************************************************************************************************** */


// function for activating the number
async function light(digit, number){

  // Turn on the given digit place
    digit && digit.writeSync(1)

    // Turn on each segment given on the given digit
    numbers[number] && numbers[number].forEach(e => {
        e.writeSync(1)
    })

    // Wait 1 millisecond
    await delay(1)

    // Turn digit and all segments for it off
    digit && digit.writeSync(0)
    numbers[number] && numbers[number].forEach(e => {
        e.writeSync(0)
    })

    // Wait 1 more millisecond
    await delay(1)

    // Only returns true so that the program will wait for this digit
    // to finish before moving on to the next digit
    return true
}

// Delay function ( you will use sleep in place of any instance in this program where you see 'delay' )
function delay(t) {
    return new Promise((resolve) => setTimeout(resolve, t));
}

run()
