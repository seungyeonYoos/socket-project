var express = require("express");
const { emit } = require("process");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.get("/", (req,res)=>{
    res.render("index");
})

app.get("/class", (req,res)=>{
    res.render("class");
})

var client_list = {};

// client_list = {
//     dfdfdskejfs: "김소연",
//     dfdfdfsdfed: "유승연"
// }

io.on("connection", function ( socket ){ //소켓에 대한 코드는 다 여기다가 넣어주면 됨
    // console.log("Server Socket Connected", socket.id);
        // io.emit("notice", `${socket.id}님이 입장하셨습니다.`);

        //본인이 보내고 싶은 클라이언트의 id를 to안에 쓰면 해당하는 사람한테만 emit할 수 있음
        // io.to(소켓아이디).emit();

    socket.on("disconnect", ()=>{
        delete client_list[socket.id] //무조건 내 소켓 아이디가 들어감 딕셔너리에 있는 이 값을 가진 거를 삭제할수 있음
        io.emit("clientUpdate", client_list);
        // io.emit("notice", `${socket.id}님이 입장하셨습니다.`);
        }) //접속 끊겼을때 뭐할건지
    
    socket.on("sendMsg", ( data )=>{ //이 이벤트가 들어왔을때 내가 하고 싶은 동작
        console.log(data);
        if(data.dm == "all"){
            io.emit( "send", data )
        } else {
            io.to(data.dm).emit("send", data);
            socket.emit("send",data);
        }
         //나한테만 전하고 싶으면 socket.emit
        // socket.emit( "dayChat", )
        })

    socket.on("setNick", ( nick )=>{
        console.log("aaaa",Object.values(client_list));
        
        if( Object.values(client_list).indexOf(nick) > -1){
            socket.emit( "err" , "중복되는 닉네임 입니다." );
        }else {
            client_list[socket.id] = nick; //소켓 아이디에다가 닉이라는 밸류를 넣었다는 뜻
            socket.emit("entrySuccess", "입장 성공")
            io.emit("clientUpdate", client_list)
            io.emit("notice", nick)
        }
        // 배열에서 내가원하는 값의 존재여부를 확인할 수 있는 함수 : aar.indexOf();
        })
    
});


http.listen(8000, () => {
    console.log( "server: ", 8000 );
})