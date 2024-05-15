import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
export async function init(common){
    const cacher = document.getElementById("cache-media")

    let time = 0
    let total = 0


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

    document.getElementById("play itunes").addEventListener("click",async function(e) {
        await common.socketAdminAsync('sendMusic',{event:"play itunes",cacher:cacher.checked})
    });

    document.getElementById("pause itunes").addEventListener("click",async function(e) {
        await common.socketAdminAsync('sendMusic',{event:"pause itunes",cacher:cacher.checked})
    });
    
    document.getElementById("close player").addEventListener("click",async function(e) {
        await common.socketAdminAsync('sendMusic',{event:"close",cacher:cacher.checked})
    });


    document.getElementById("media-progress").addEventListener("click", async function(e) {
  
        var max = $(this).width(); //Get width element
        var pos = e.pageX - $(this).offset().left; //Position cursor
        var dual = Math.round(pos / max * 100); // Round %
    
    
        if (dual > 100) {
          var dual = 100;
        }
    
        $(this).val(dual);
        
        document.getElementById("progress-value").innerHTML = time_code(time) + " / " + time_code(total)

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

    function time_code(time){
        time = Math.floor(time/1000)
        let h = Math.floor(time/3600)
        let m = Math.floor((time - h*3600)/60) 
        let s = Math.floor(time - h*3600 - m*60)
        return h + ":" + (String(m).length == 1?"0":"") + m + ":" + (String(s).length == 1?"0":"") + s
    }

    socket.on("connect", () => {
        socket.on("info",msg => {
            time = msg.time
            total = msg.total
            
            document.getElementById("media-progress").value = msg.progress
            document.getElementById("progress-value").innerHTML = time_code(time) + " / " + time_code(total)
            document.getElementById("media-progress_vol").value = msg.volume
            document.getElementById("progress-value_vol").innerHTML = "audio: " + msg.volume + " %";
        });
    });
}