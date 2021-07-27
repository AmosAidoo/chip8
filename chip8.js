/*
    Specification
 
    - Memory: 4 KB
    - Display: 64 x 32 pixels monochrome
    - A program counter, PC
    - One 16-bit index register called I
    - A stack for 16-bit addresses
    - An 8-bit delay timer which is decremented at a rate of 60 Hz
    - An 8-bit sound timer which functions like the delay timer, but gives off a beeping sound as long as its not zero
    - 16 8-bit general-purpose variable registers

    fetch-decode-execute cycle
    An instruction is 2 bytes
*/

const MEMORY_LIMIT = 4096
const SCREEN_WIDTH = 640
const SCREEN_HEIGHT = 320
let memory = new Array(MEMORY_LIMIT)
let stack = []
let display = []
let program = null

// Program counter and index register
let PC, I

// V0, V1, V2, V3, V4, V5, V6, V7, V8, V9, VA, VB, VC, VD, VE, VF
let V = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

let delayTimer = 0
let soundTimer = 0

// Set fonts
memory[0x50] = 0xF0, memory[0x51] = 0x90, memory[0x52] = 0x90, memory[0x53] = 0x90, memory[0x54] = 0xF0 // 0
memory[0x55] = 0x20, memory[0x56] = 0x60, memory[0x57] = 0x20, memory[0x58] = 0x20, memory[0x59] = 0x70 // 1 
memory[0x60] = 0xF0, memory[0x61] = 0x10, memory[0x62] = 0xF0, memory[0x63] = 0x80, memory[0x64] = 0xF0 // 2
memory[0x65] = 0xF0, memory[0x66] = 0x10, memory[0x67] = 0xF0, memory[0x68] = 0x10, memory[0x69] = 0xF0 // 3
memory[0x70] = 0x90, memory[0x71] = 0x90, memory[0x72] = 0xF0, memory[0x73] = 0x10, memory[0x74] = 0x10 // 4
memory[0x75] = 0xF0, memory[0x76] = 0x80, memory[0x77] = 0xF0, memory[0x78] = 0x10, memory[0x79] = 0xF0 // 5
memory[0x80] = 0xF0, memory[0x81] = 0x80, memory[0x82] = 0xF0, memory[0x83] = 0x90, memory[0x84] = 0xF0 // 6
memory[0x85] = 0xF0, memory[0x86] = 0x10, memory[0x87] = 0x20, memory[0x88] = 0x40, memory[0x89] = 0x40 // 7
memory[0x90] = 0xF0, memory[0x91] = 0x90, memory[0x92] = 0xF0, memory[0x93] = 0x90, memory[0x94] = 0xF0 // 8
memory[0x95] = 0xF0, memory[0x96] = 0x90, memory[0x97] = 0xF0, memory[0x98] = 0x10, memory[0x99] = 0xF0 // 9

function clearScreen() {
    for (let y = 0; y < SCREEN_HEIGHT / 10; y++){
        for (let x = 0; x < SCREEN_WIDTH / 10; x++)
            display[y][x] = 0
    }
}

function displayScreen() {
    for (let y = 0; y < SCREEN_HEIGHT / 10; y++)
        for (let x = 0; x < SCREEN_WIDTH / 10; x++) {
            if (display[y][x] == 0){
                fill(0)
                rect(x*10, y*10, 10, 10)
            } else {
                fill(255)
                rect(x*10, y*10, 10, 10)
            }
                
        }
}

function setup() {
    let canvas = createCanvas(640, 320)
    canvas.parent("screen")

    let input = createFileInput((file) => {
        print(typeof(file))
        // console.log(file)
        print(file)
        print(file.type)

        let reader = new FileReader();

        reader.onload = function(e) {
            // binary data
            program = new Uint8Array(e.target.result)
            draw()
        }

        reader.onerror = function(e) {
            // error occurred
            console.log('Error : ' + e.type)
        }
        reader.readAsArrayBuffer(file.file)
    })
    
    input.parent("under")

    // Initialize the screen values
    for (let y = 0; y < SCREEN_HEIGHT / 10; y++){
        display[y] = new Array(SCREEN_WIDTH / 10)
        for (let x = 0; x < SCREEN_WIDTH / 10; x++)
            display[y][x] = 0
    }

    // IBM Logo Test Program. This program prints the IBM Logo and enters an infinite loop
    // loadProgram(new Uint8Array([
    //     0x00, 0xe0, 0xa2, 0x2a, 0x60, 0x0c, 0x61, 0x08,    0xd0, 0x1f, 0x70, 0x09, 0xa2, 0x39, 0xd0, 0x1f, 
    //     0xa2, 0x48, 0x70, 0x08, 0xd0, 0x1f, 0x70, 0x04,    0xa2, 0x57, 0xd0, 0x1f, 0x70, 0x08, 0xa2, 0x66, 
    //     0xd0, 0x1f, 0x70, 0x08, 0xa2, 0x75, 0xd0, 0x1f,    0x12, 0x28, 0xff, 0x00, 0xff, 0x00, 0x3c, 0x00, 
    //     0x3c, 0x00, 0x3c, 0x00, 0x3c, 0x00, 0xff, 0x00,    0xff, 0xff, 0x00, 0xff, 0x00, 0x38, 0x00, 0x3f, 
    //     0x00, 0x3f, 0x00, 0x38, 0x00, 0xff, 0x00, 0xff,    0x80, 0x00, 0xe0, 0x00, 0xe0, 0x00, 0x80, 0x00,
    //     0x80, 0x00, 0xe0, 0x00, 0xe0, 0x00, 0x80, 0xf8,    0x00, 0xfc, 0x00, 0x3e, 0x00, 0x3f, 0x00, 0x3b, 
    //     0x00, 0x39, 0x00, 0xf8, 0x00, 0xf8, 0x03, 0x00,    0x07, 0x00, 0x0f, 0x00, 0xbf, 0x00, 0xfb, 0x00, 
    //     0xf3, 0x00, 0xe3, 0x00, 0x43, 0xe0, 0x00, 0xe0,    0x00, 0x80, 0x00, 0x80, 0x00, 0x80, 0x00, 0x80,
    //     0x00, 0xe0, 0x00, 0xe0
    // ]))
}

function draw() {
    noStroke()
    clearScreen()
    displayScreen()
    
    if (program) {
        loadProgram(program)
        emulate()
        noLoop()
    }
    
}

function loadProgram(program) {
    PC = 0x200
    for (let i = PC; i < PC + program.byteLength; i++) {
        memory[i] = program[i-PC]
    }
}

function emulate() {
    let intervalId

    function invalidInstruction(id) {
        console.log("Instruction not identified")
        clearInterval(id)
    }
    intervalId = setInterval(() => {
        // Run the fetch-decode-execute cycle at 700 instructions per second
        console.log("Initial PC = ", PC)
        // Fetch
        let instruction = (memory[PC] << 8) | memory[PC+1]
        PC += 2
        const kind = (instruction >> 12) & 0xf // kind of instruction
        const X = (instruction >> 8) & 0xf // V0 - VF
        const Y = (instruction >> 4) & 0xf // V0 - VF
        const N = instruction & 0x000f // 4-bit number
        const NN = instruction & 0x00ff // 8-bit immediate number
        const NNN = instruction & 0x0fff // 12-bit immediate memory address

        console.log("Current instruction", instruction.toString(16))
        console.log("Kind = ", kind)

        // Decode and Execute
        switch (kind) {
            case 0x0: {
                switch (X) {
                    case 0x0: {
                        switch (Y) {
                            case 0xE: {
                                switch (N) {
                                    case 0x0: {
                                        // Clear screen
                                        clearScreen()
                                        break
                                    }
                                }
                                break
                            }

                            default: {
                                invalidInstruction(intervalId)
                            }
                        }
                        break
                    }

                    default: {
                        invalidInstruction(intervalId)
                    }
                }
                break
            }

            case 0x1: {
                // Jump instruction
                PC = NNN
                break
            }

            case 0x2: {
                break
            }

            case 0x6: {
                // Set register VX to the value NN
                console.log()
                V[X] = NN
                break
            }

            case 0x7: {
                // Add NN to VX
                V[X] += NN
                break
            }

            case 0xA: {
                // Set index
                I = NNN
                break
            }

            case 0xD: {
                let x = V[X] % 64, y = V[Y] % 32
                V[0xF] = 0

                for (let i = 0; i < N; i++) {
                    let spriteData = memory[I+i]

                    for (let j = 7; j >= 0; j--) {
                        if (display[y][x] && (spriteData & (1 << j)) > 0) {
                            display[y][x] = 0
                            V[0xF] = 1
                        } else if (display[y][x] == 0 && (spriteData & (1 << j)) > 0) {
                            display[y][x] = 1
                        }

                        if (x >= 64) break
                        x++
                    }
                    x = V[X] % 64
                    y++
                    if (y >= 32) break
                }
                displayScreen()
                break
            }

            default: {
                invalidInstruction(intervalId)
            }

        }
    }, 1000 / 700 )
}