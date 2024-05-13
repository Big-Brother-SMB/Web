import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
export async function init(common){
    const cacher = document.getElementById("cache-media")
    document.getElementById("send").addEventListener("click",async function(){
        await common.socketAdminAsync('sendMusic',{event:"download" ,url:document.getElementById("link_yt").value,cacher:cacher.checked,type:"video"})
    })

    document.getElementById("play").addEventListener("click",async function(e) {
        await common.socketAdminAsync('sendMusic',{event:"play",cacher:cacher.checked})
    });

    document.getElementById("pause").addEventListener("click",async function(e) {
        await common.socketAdminAsync('sendMusic',{event:"pause",cacher:cacher.checked})
    });

    document.getElementById("stop").addEventListener("click",async function(e) {
        await common.socketAdminAsync('sendMusic',{event:"stop",cacher:cacher.checked})
    });

    document.getElementById("itunes").addEventListener("click",async function(e) {
        await common.socketAdminAsync('sendMusic',{event:"itunes",cacher:cacher.checked})
    });
    


    document.getElementById("media-progress").addEventListener("click", async function(e) {
  
        var max = $(this).width(); //Get width element
        var pos = e.pageX - $(this).offset().left; //Position cursor
        var dual = Math.round(pos / max * 100); // Round %
    
    
        if (dual > 100) {
          var dual = 100;
        }
    
        $(this).val(dual);
        document.getElementById("progress-value").innerHTML = dual + " %";

        await common.socketAdminAsync('sendMusic',{event:"progress",progress:dual})
    });

    document.getElementById("media-progress_vol").addEventListener("click", async function(e) {
  
        var max = $(this).width(); //Get width element
        var pos = e.pageX - $(this).offset().left; //Position cursor
        var dual = Math.round(pos / max * 300); // Round %
    
    
        if (dual > 300) {
          var dual = 300;
        }
    
        $(this).val(dual);
        document.getElementById("progress-value_vol").innerHTML = "audio: " + dual + " %";
        
        await common.socketAdminAsync('sendMusic',{event:"volume",volume:dual})
    });

    let socket = io("/music",{
        auth: {
          token: common.key
        }
    });

    socket.on("connect", () => {
        socket.on("info",msg => {
            console.log(msg)
            document.getElementById("media-progress").value = msg.progress
            document.getElementById("progress-value").innerHTML = parseInt(msg.progress) + " %";
            document.getElementById("media-progress_vol").value = msg.volume
            document.getElementById("progress-value_vol").innerHTML = "audio: " + msg.volume + " %";
        });
    });
}