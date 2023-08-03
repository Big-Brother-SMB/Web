export async function init(common){
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    if(params.pdf!=null){
        common.display(document.getElementById('cnv'),'/asso/article/pdf/' + params.pdf + '.pdf')
    }
}