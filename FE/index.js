const clientIo = io("http://localhost:3000");

clientIo.emit("sayHi","Hello from FE",(res)=>{
    console.log(res)
})

clientIo.on("connect",()=>{
    console.log("client connected")
})