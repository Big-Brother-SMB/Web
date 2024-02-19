export async function init(common){
    if(common.admin_permission["messagerie"]==0) common.loadpage("/options")
}