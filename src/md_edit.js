/*
- [云即·资源助手]
- ©版权所有：2024-2025 YNYU @lvynyu2.gmail.com
- 禁止未授权的商用及二次编辑
- 禁止用于违法行为，如有，与作者无关
- 二次编辑需将引用部分开源
- 引用开源库的部分应遵循对应许可
- 使用当前代码时禁止删除或修改本声明
*/

const modelFlow = document.getElementById('model-flow');//节点模式的窗口
const modelView = document.getElementById('model-view');//预览模式的窗口
const modelData = document.getElementById('model-data');//编辑模式的窗口
const modelList = document.getElementById('model-list');//模板主题列表
const modelTable = document.getElementById('model-table');//模板配置项
const selectZY = document.getElementById('select-zy');//模板下单个资源的配置项
const ediD = document.getElementById('editor-data');//切换为编辑模式的按钮
const ediF = document.getElementById('editor-flow');//切换为节点模式的按钮
const ediV = document.getElementById('editor-view');//切换为预览模式的按钮
const cloneImgView1 = document.getElementById('cloneImg-view-1');//克隆所选资源生成的node到预览界面（仿瀑布流）
const cloneImgView2 = document.getElementById('cloneImg-view-2');
const cloneImgView3 = document.getElementById('cloneImg-view-3');
const cloneImgView4 = document.getElementById('cloneImg-view-4');
const moDside = document.getElementById("moDside");//模板配置项侧边栏
const moDsideArea = document.getElementById("moDside-area");//模板配置项侧边栏占位，用于布局
const moDshowSetBtn = document.getElementById("show-set");//模板配置项侧边栏展开/收起按钮，实际区域为整个顶部
const imgView = document.getElementById("imgView");//编辑模式下资源展示容器，仅显示选中的资源
const imgViewBox = document.getElementById("imgView-box");//编辑模式下资源包裹容器，用于裁剪因缩放产生的空白区域
const imgViewInfo = document.getElementById("imgView-info");//编辑模式下展示资源的主要信息
const imgViewSlider = document.getElementById("imgView-size-slider");//控制资源缩放的滑杆
const imgViewUp = document.getElementById("imgView-size-up");//控制资源放大
const imgViewDown = document.getElementById("imgView-size-down");//控制资源缩小
const imgViewAuto = document.getElementById("imgView-size-auto");//自动缩放到合适大小
const zoomNum = document.getElementById("zoom-num");//显示当前缩放大小的容器
const toPlugin = document.getElementById("to-plugin")
var exportAllname = '';//提单信息中的资源名汇总，格式应该为：KV+ XXX资源位：资源名称(+重复编号) 宽×高
var zyAllname = [];//所选资源生成的node所对应的名称，格式应该为:资源名称(+重复编号) 宽×高
var zyAllId = [];//所选资源生成的node所对应的ID，格式应该为:zy_序号_宽_高
var zyClones = [];//所选资源生成的node所对应的克隆集合

//交互参数
var isDragging = false;//拖拽画布
var clickX = 0,clickY = 0,moveX = 0,moveY = 0,moveXX = 0,moveYY = 0;
var touchXY = 0,touchScale = 1,touchSS = 1;
var zoom = 40;//缩放比例
var viewport = {
    x:0,
    y:0,
    center:[0,0],
}//画布参数

imgViewUp.onclick = ()=>{
    imgViewSlider.value = imgViewSlider.value*1 + 10;
    imgViewBox.style.transform = 'scale( '+ imgViewSlider.value/100 + ')';//借助滑杆自带的极值机制，可以省去值范围的判断逻辑
    reZoom();
};
imgViewSlider.oninput = ()=>{
    imgViewBox.style.transform = 'scale( '+ imgViewSlider.value/100 + ')';
    reZoom();
};
imgViewDown.onclick = ()=>{
    imgViewSlider.value -= 10;
    imgViewBox.style.transform = 'scale( '+ imgViewSlider.value/100 + ')';
    reZoom();
};
imgViewAuto.onclick = ()=>{
    moDautoZoom();
}

/*
toPlugin.ondragstart = (event)=>{
    var text = JSON.stringify(userImgData);
    event.dataTransfer.setData('text/plain',text);
    console.log(text)
}*/

function sendData(event,isDown){
    var text = JSON.stringify(userImgData);
    //console.log(text)
    if(isDown){
        var blob = new Blob([text],{type:'text/plain'})
        var link = document.createElement('a');
        link.download = userImgData.main.title[0] + '.zy';
        link.href = URL.createObjectURL(blob);
        link.click();
        link.remove();
    } else {
        event.dataTransfer.setData('text/plain',text);
    
    } 
}

//展开配置项
function moDshowSet(){
    if(moDshowSetBtn.checked){
        modelTable.style.display = 'flex';
        moDsideArea.style.display = 'flex';
        moDside.style.overflow = 'hidden';
        moDside.className = 'df-ffc moDside ovh';
        imgViewInfo.style.top = '10px';
    }else{
        modelTable.style.display = 'none';
        moDside.style.overflow = 'visible';
        moDsideArea.style.display = 'none';
        moDside.className = 'df-ffc moDside-float ovh';
        imgView.style.width = '100%';
        imgViewInfo.style.top = '60px';
    };
}
//自动缩放
function moDautoZoom(){
    var size1 = imgView.offsetWidth/(imgViewBox.offsetWidth + 200);
    var size2 = imgView.offsetHeight/(imgViewBox.offsetHeight + 200);
    var size = size1 > size2 ? size2 : size1
    imgViewSlider.value = size*100;
    imgViewBox.style.transformOrigin = '50% 50%';
    imgViewBox.style.transform = 'scale('+ size +')';
    imgViewBox.parentNode.style.transform = 'translate(0,0)'
    reZoom();
    isDragging = false;
    clickX = 0,clickY = 0,moveX = 0,moveY = 0,moveXX = 0,moveYY = 0;
}
//修改窗口展示的缩放数值
function reZoom() {
    zoomNum.innerHTML = imgViewSlider.value + '%';
    zoom = imgViewSlider.value;
}
//动态添加模板主题
function addModelList(){
    models.forEach((value,index)=> {
        var setimg = "";
        if(value.img){
            setimg = `<img class="pos-a-cc model-img"  height="60%"  src="` + value.img + `" />`;
        }
        var node = document.createElement('div')
        node.className = "model-info"
        var inputs = `<input type="checkbox" id="model-pick-`
        if(index == 0){
            inputs = `<input type="checkbox" checked="true" id="model-pick-`
        }
        node.innerHTML = inputs + index + `" style="display: none;" 
        onchange="
        if(this.checked){
        onlyTab(this,this.parentNode.parentNode);
        modelPick = ` + index + ` ;
        }else{
        }"/>
        <label class="model-pick"  for="model-pick-` + index + `" style="position: relative;">
            `+ setimg +`
            <div style="position: absolute; bottom:0; background:var(--boxBak); width:100%; height:30px; display:flex; justify-content: center;align-items: center; border-radius:0 0 8px 8px; opacity:var(--model-info); border-top: 1px solid var(--boxBod); ">`+ value.name +`</div>
            <div style="width:100%; height:100%; box-sizing: border-box; background:var(--model-img); border-radius: 8px; border:var(--model-b); padding:4px " >` + index + `</div>
        </label>`;
        modelList.appendChild(node);
    })
    
    var node = document.createElement('div');
    node.className = "model-info-tips cc";
    node.innerHTML = `<div class="wh100 model-info-tips cc" style="background:none; border:none" id="to-plugin" draggable="true" ondragstart="sendData(event,false)" onclick="sendData(event,true)"><div style="opacity:0.5;" >更多需要</div><div style="opacity:0.5;">请联系定制~<div><div>`;
    modelList.appendChild(node);
}


//动态生成资源
function addZYtable(){
    imgViewBox.innerHTML = '';
    zyAllname = [];
    zyAllId = [];
    var zys = userImgData.zy;

    /*资源切换option*/
    if(exportAllname || zys.length > 0){
        if(exportAllname){
            allname = exportAllname.split('KV+\n')[1].split('\n');
        }else{
            allname = [zys[0].img.name + ' ' + zys[0].img.w + '×' + zys[0].img.h]
        }
        var num = 0;
        var options = '';
        for(var i = 0; i < allname.length; i++){
            if(allname[i].split('×').length == 1){
                options += '<optgroup label="' + allname[i].split('-')[0] + '">'
            } else if (allname[i + 1] && allname[i + 1].split('×').length == 1) {
                num++
                options += '<option value="' + 'zy_'+ num + '_' + zys[num - 1].img.w + '_' + zys[num - 1].img.h + '">' + allname[i] + '</option></optgroup>';
                zyAllname.push(allname[i])
            } else {
                num++
                options += '<option value="' + 'zy_'+ num + '_' + zys[num - 1].img.w + '_' + zys[num - 1].img.h + '">' + allname[i] + '</option>';
                zyAllname.push(allname[i])
            }
        }
        selectZY.innerHTML = options;
    }
    

    zys.forEach((item,index) => {
        /*资源位节点*/
        var imgnode = document.createElement("div");
        var imgid = 'zy_'+ (index + 1) + '_' + item.img.w + '_' + item.img.h;
        zyAllId.push(imgid)
        setImgLayout(imgnode,imgid,item.img,(index + 1))
        /*资源位配置节点*/
        var setnode = document.createElement("div");
        setnode.id = 'zy_'+ (index + 1)  + '_set';
        setnode.className = 'df-ffc';
        setnode.style.gap = '2px';
        
        if(index == 0){
            imgnode.style.display = 'block';
            setnode.style.display = 'flex';  
            document.getElementById('zy-info-size').textContent = item.img.w + '×' + item.img.h;
            document.getElementById('zy-info-channel').textContent = item.channel[0];
            document.getElementById('zy-info-game').textContent = userImgData.main.game[0];
        } else {
            imgnode.style.display = 'none';
            setnode.style.display = 'none';
        }

        imgViewBox.appendChild(imgnode);
        //console.log(imgnode)
    });
    reimgClone();
    setimgMain('fontFamily-main',userImgData.style.title.fontfamily);
    setimgMain('fontFamily-sec',userImgData.style.sectitle.fontfamily);
}
 function setImgLayout(node,imgid,imgInfo,imgNum){
    var w = imgInfo.w, h = imgInfo.h, type = imgInfo.type, safa = imgInfo.safa , info = imgInfo.info;
    if(!info){info = [1,1,0,1,0]};
    if(!type){type = "jpg"};
    var fontsizes = [0,0,0];
    var ww = w, hh = h;
    //console.log(111)
    if(safa && safa[0]){
        ww = safa[0][2];
        //hh = safa[0][3];
        //console.log(222)
    };
    if(ww > hh){
        var findW = userImgData.public.framesize.ww.map(item => Math.abs(hh - item) )
        findW.forEach((item,index) => {
            if(item == Math.min(...findW)){
                //console.log(ww,hh,findW,userImgData.public.fontsize[index])
                if((index - 1) < 0){
                    fontsizes =  userImgData.public.fontsize[0];
                    userImgData.zy[imgNum - 1].set.fontsize = fontsizes;
                }else {
                    fontsizes =  userImgData.public.fontsize[index];
                    userImgData.zy[imgNum - 1].set.fontsize = fontsizes;
                    if (info[1] == 0){
                        fontsizes =  userImgData.public.fontsize[index + 1];
                        userImgData.zy[imgNum - 1].set.fontsize = fontsizes;
                    }
                    if (info[2] == 1 || info[4] == 1){
                        fontsizes =  userImgData.public.fontsize[index - 1];
                        userImgData.zy[imgNum - 1].set.fontsize = fontsizes;
                    }
                }
                
            }
        })
    } else {
        var findH = userImgData.public.framesize.hh.map(item => Math.abs(ww - item) )
        
        findH.forEach((item,index) => {
            if(item == Math.min(...findH)){
                //console.log(ww,hh,findH,userImgData.public.fontsize[index])
                if((index - 1) < 0){
                    fontsizes =  userImgData.public.fontsize[0];
                    userImgData.zy[imgNum - 1].set.fontsize = fontsizes;
                } else {
                    fontsizes =  userImgData.public.fontsize[index];
                    userImgData.zy[imgNum - 1].set.fontsize = fontsizes;
                    if (info[1] == 0){
                        fontsizes =  userImgData.public.fontsize[index + 1];
                        userImgData.zy[imgNum - 1].set.fontsize = fontsizes;
                    }
                    
                }
                
            }
        })
    };

    if(type != 'png'){
        node.style.background = 'var(--boxGry)';
    };
    
    var titleNode = '',sectitleNode = '',giftNode = '',mainLayout = '',bgLayout = '';
    if (info[0] == 1) {
        titleNode = `<div 
        style="font-size:` + fontsizes[2] + `px; 
        line-height:` + fontsizes[2] + `px; 
        color:` + userImgData.style.title.color + `;
        font-family:'` + userImgData.style.title.fontfamily + `';" 
        data-title="0">`
         + userImgData.main.title[0].replace('，','<br>') +
        `</div>`;
    };
    if (info[1] == 1) {
        sectitleNode = `<div 
        style="font-size: ` + fontsizes[1] + `px; 
        line-height:` + fontsizes[1] + `px; 
        color:` + userImgData.style.sectitle.color + `;
        font-family:'` + userImgData.style.sectitle.fontfamily + `';" 
        data-sectitle="0">` 
        + userImgData.main.sectitle[0].replace('，','<br>') +
        `</div>`;
    };

    var isgiftview1,isgiftview2,isgiftview3,isgiftview4;
    var isgiftview = userImgData.main.gift.isview;
    isgiftview[0]?isgiftview1 = 'flex':isgiftview1 = 'none';
    isgiftview[1]?isgiftview2 = 'flex':isgiftview2 = 'none';
    isgiftview[2]?isgiftview3 = 'flex':isgiftview3 = 'none';
    isgiftview[3]?isgiftview4 = 'flex':isgiftview4 = 'none';

    var istagview1,istagview2,istagview3,istagview4;
    var istagview = userImgData.main.gift.tagview;
    istagview[0]?istagview1 = 'flex':istagview1 = 'none';
    istagview[1]?istagview2 = 'flex':istagview2 = 'none';
    istagview[2]?istagview3 = 'flex':istagview3 = 'none';
    istagview[3]?istagview4 = 'flex':istagview4 = 'none';

    if(info[2] == 1){
        var keyScale = 1;
        if(hh < 300){
            keyScale = 0.8;
        }
        giftNode = `
        <div class="cc w100 cc" style="gap:` + fontsizes[1]*1.5 + `px; ">
            <div class="pos-r df-ffc cc" data-gift="0" style="width:` + fontsizes[2]*1.5*keyScale + `px; box-sizing: border-box; display:` + isgiftview1 + ` ">
                <div class="gift-box pos-r cc" style="width:` + fontsizes[2]*1.5*keyScale + `px; height:` + fontsizes[2]*1.5*keyScale + `px; padding:` + fontsizes[0]*0.8 + `px;">
                    <div data-tag="0" class="gift-tag pos-a df cc" style="font-size: ` + fontsizes[0]*0.8 + `px; padding:` + fontsizes[0]*0.2 + `px;
                    color:` + userImgData.style.tags.color + `;
                    display:` + istagview1 + `;
                    font-family:'` + userImgData.style.tags.fontfamily + `';" >
                        <div data-tag-num="0">`+ userImgData.main.gift.num[0].replace('，','<br>') +`</div>
                    </div>

                    <img data-gift-icon="0" class="w100" src="` + userImgData.main.gift.icon[0] + `">
                    <img data-gift-icon-bg width="` + fontsizes[2]*1.5*keyScale + `px" height="` + fontsizes[2]*1.5*keyScale + `px" class="pos-a-cc" src="` + userImgData.main.layout.bg_gift_icon.image + `">

                    <div class="df pos-a" style="bottom:-` + fontsizes[0] + `px;">
                        <div data-gift-name="0" style=" flex: 0 0 auto; font-size: ` + fontsizes[0] + `px; 
                        color:` + userImgData.style.giftname.color + `;
                        font-family:'` + userImgData.style.giftname.fontfamily + `';" >`
                        + userImgData.main.gift.name[0] +
                        `</div>
                    </div>  
                </div>
            </div>

            <div class="pos-r df-ffc cc" data-gift="1" style="width:` + fontsizes[2]*1.5*keyScale + `px; box-sizing: border-box; display:` + isgiftview2 + `">
                <div class="gift-box pos-r cc" style="width:` + fontsizes[2]*1.5*keyScale + `px; height:` + fontsizes[2]*1.5*keyScale + `px; padding:` + fontsizes[0]*0.8 + `px;">
                    <div data-tag="1" class="gift-tag pos-a df cc" style="font-size: ` + fontsizes[0]*0.8 + `px; padding:` + fontsizes[0]*0.2 + `px;
                    color:` + userImgData.style.tags.color + `;
                    display:` + istagview2 + `;
                    font-family:'` + userImgData.style.tags.fontfamily + `';" >
                        <div data-tag-num="1">`+ userImgData.main.gift.num[1].replace('，','<br>') +`</div>
                    </div>

                    <img data-gift-icon="1" class="w100" src="` + userImgData.main.gift.icon[1] + `">
                    <img data-gift-icon-bg width="` + fontsizes[2]*1.5*keyScale + `px" height="` + fontsizes[2]*1.5*keyScale + `px" class="pos-a-cc" src="` + userImgData.main.layout.bg_gift_icon.image + `">

                    <div class="df pos-a" style="bottom:-` + fontsizes[0] + `px;">
                        <div data-gift-name="1" style=" flex: 0 0 auto; font-size: ` + fontsizes[0] + `px; 
                        color:` + userImgData.style.giftname.color + `;
                        font-family:'` + userImgData.style.giftname.fontfamily + `';" >`
                        + userImgData.main.gift.name[1] +
                        `</div>
                    </div>  
                </div>
            </div>

            <div class="pos-r df-ffc cc" data-gift="2" style="width:` + fontsizes[2]*1.5*keyScale + `px; box-sizing: border-box; display:` + isgiftview3 + `">
                <div class="gift-box pos-r cc" style="width:` + fontsizes[2]*1.5*keyScale + `px; height:` + fontsizes[2]*1.5*keyScale + `px; padding:` + fontsizes[0]*0.8 + `px;">
                    <div data-tag="2" class="gift-tag pos-a df cc" style="font-size: ` + fontsizes[0]*0.8 + `px; padding:` + fontsizes[0]*0.2 + `px;
                    color:` + userImgData.style.tags.color + `;
                    display:` + istagview3 + `;
                    font-family:'` + userImgData.style.tags.fontfamily + `';" >
                        <div data-tag-num="2">`+ userImgData.main.gift.num[2].replace('，','<br>') +`</div>
                    </div>

                    <img data-gift-icon="2" class="w100" src="` + userImgData.main.gift.icon[2] + `">
                    <img data-gift-icon-bg width="` + fontsizes[2]*1.5*keyScale + `px" height="` + fontsizes[2]*1.5*keyScale + `px" class="pos-a-cc" src="` + userImgData.main.layout.bg_gift_icon.image + `">

                    <div class="df pos-a" style="bottom:-` + fontsizes[0] + `px;">
                        <div data-gift-name="2" style=" flex: 0 0 auto; font-size: ` + fontsizes[0] + `px; 
                        color:` + userImgData.style.giftname.color + `;
                        font-family:'` + userImgData.style.giftname.fontfamily + `';" >`
                        + userImgData.main.gift.name[2] +
                        `</div>
                    </div>  
                </div>
            </div>

            <div class="pos-r df-ffc cc" data-gift="3" style="width:` + fontsizes[2]*1.5*keyScale + `px; box-sizing: border-box; display:` + isgiftview4 + `">
                <div class="gift-box pos-r cc" style="width:` + fontsizes[2]*1.5*keyScale + `px; height:` + fontsizes[2]*1.5*keyScale + `px; padding:` + fontsizes[0]*0.8 + `px;">
                    <div data-tag="3"  class="gift-tag pos-a df cc" style="font-size: ` + fontsizes[0]*0.8 + `px; padding:` + fontsizes[0]*0.2 + `px;
                    color:` + userImgData.style.tags.color + `;
                    display:` + istagview4 + `;
                    font-family:'` + userImgData.style.tags.fontfamily + `';" >
                        <div data-tag-num="3">`+ userImgData.main.gift.num[3].replace('，','<br>') +`</div>
                    </div>

                    <img data-gift-icon="3" class="w100" src="` + userImgData.main.gift.icon[3] + `">
                    <img data-gift-icon-bg width="` + fontsizes[2]*1.5*keyScale + `px" height="` + fontsizes[2]*1.5*keyScale + `px" class="pos-a-cc" src="` + userImgData.main.layout.bg_gift_icon.image + `">

                    <div class="df pos-a" style="bottom:-` + fontsizes[0] + `px;">
                        <div data-gift-name="3" style=" flex: 0 0 auto; font-size: ` + fontsizes[0] + `px; 
                        color:` + userImgData.style.giftname.color + `;
                        font-family:'` + userImgData.style.giftname.fontfamily + `';" >`
                        + userImgData.main.gift.name[3] +
                        `</div>
                    </div>  
                </div>
                
            </div>
            

        </div>`
    };

    var setMainSize = '',setBgSize = '';
    w/h > userImgData.main.layout.bg_main.w/userImgData.main.layout.bg_main.h ? setMainSize = 'height="'+ h +'px"' : setMainSize = 'width="'+ w +'px"';//主体元素不能裁切
    w/h > userImgData.main.layout.bg_bg.w/userImgData.main.layout.bg_bg.h ? setBgSize = 'width="'+ w +'px"' : setBgSize = 'height="'+ h +'px"';//背景元素充满画面，可裁切

    mainLayout = '<img ' + setMainSize + ' src="' + userImgData.main.layout.bg_main.image + '" data-layout-main class="pos-a-cc" style="z-index:2"/>'

    if(imgInfo.type !== 'png'){
        bgLayout = '<img ' + setBgSize + ' src="' + userImgData.main.layout.bg_bg.image + '" data-layout-bg class="pos-a-cc"/>'
    }
    
    var logoNode = '';
    var infoNode = `
    <div class="cc df-ffc pos-a-cc w100" data-info style="gap:` + fontsizes[0]*0.8 + `px;    filter:drop-shadow(0 0 `+ fontsizes[1]*0.2 +`px var(--title-sd-clr,rgba(0,0,0,0.2))); z-index:20;">
    `+ titleNode + sectitleNode + giftNode +`
    </div>`;

    var gameView,channelView;
    userImgData.main.logoview[0]?gameView = 'block':gameView = 'none';
    userImgData.main.logoview[1]?channelView = 'block':channelView = 'none';

    var logos =`
        <div class="df cc logos" >
        <img data-logo-game="`+ imgNum +`" 
        src="` + games.filter(item => item.name == userImgData.main.game[0])[0].src[userImgData.main.game[1]] + `"
        style="display:`+ gameView +`"
        />
        <img data-logo-channel="`+ imgNum +`" 
        src="` +  channels.filter(item => item.name == userImgData.main.channel[0])[0].src[userImgData.main.channel[1]] + `"
        style="display:`+ channelView +`"
        />
        </div>
        `;
 

    if(info[3] == 1){
        logoNode = `
        <div class="pos-a" style="top: ` + fontsizes[0] + `; left: ` + fontsizes[0] + `; z-index: 20; 
        transform:scale(` + fontsizes[1]/64 + `);
        transform-origin: top left;
        ">`+ logos +`</div>`;
        if(w < 300 || h < 300){
            logoNode = `
            <div class="pos-a" style="top: ` + fontsizes[0]/1.5 + `; left: ` + fontsizes[0] + `; z-index: 20; 
            transform:scale(` + fontsizes[1]/64 + `);
            transform-origin: top left;
            ">`+ logos +`</div>`;
        }
    }
    

    if(safa && safa[0] ){
        if( ww <= hh){
            infoNode = `
            <div class="cc df-ffc pos-a w100" data-info style="gap:` + fontsizes[0]*0.8 + `px; bottom:` + (fontsizes[0] + (h - (safa[0][1] + safa[0][3] ))) + `px; filter:drop-shadow(0 0 `+ fontsizes[1]*0.2 +`px var(--title-sd-clr,rgba(0,0,0,0.2))); z-index:20;">
            `+ titleNode + sectitleNode + giftNode +`
            </div>`;
        }
        
        if(safa[0][4]){
            logoNode = `
            <div class="pos-a" style="top: ` + (fontsizes[0] + safa[0][1] )+ `; left: ` + (fontsizes[0] + safa[0][0]) + `; z-index: 20; 
            transform:scale(` + fontsizes[1]/64 + `);
            transform-origin: top left;
            ">`+ logos +`</div>`;
        }
    }

    if((w < 300 || h < 300 ) && info[1] && info[3] ){
        infoNode = `
            <div class="cc df-ffc pos-a w100" data-info style="gap:` + fontsizes[0]*0.8 + `px; bottom:` + fontsizes[1] + `px; filter:drop-shadow(0 0 `+ fontsizes[1]*0.2 +`px var(--title-sd-clr,rgba(0,0,0,0.2))); z-index:20;">
            `+ titleNode + sectitleNode + giftNode +`
            </div>`;
    }

    node.id = imgid;
    node.style.width = w + 'px';
    node.style.height = h + 'px';
    node.style.flex = '0,0,auto';
    node.style.fontWeight = '400';
    node.className = 'ovh pos-r zySSS';

    node.innerHTML = logoNode + infoNode +`
    <img width="`+ (Math.min(w,h) - Math.min(w,h)/10) +`px" src="https://cdn.jsdelivr.net/gh/YNYU01/listEase@1ba86723ad86e7a244ed6ef8404e4a903784bcfc/img/Icon-ListEase_200-5.png" class="pos-a-cc"  style="opacity: 0.1; filter: brightness();z-index:3;"/>
    ` + mainLayout + bgLayout


}

//切换资源位以单独编辑
function pickImg(key){
    var zys = userImgData.zy;
    var num = key.split('_')[1];
    for(var i = 0; i < zys.length; i++){
        var img = document.getElementById('zy_'+ (i + 1) + '_' + zys[i].img.w + '_' + zys[i].img.h);
        img.style.display = 'none';
    }
    document.getElementById('zy_' + num + '_' + zys[(num - 1)].img.w + '_' + zys[(num - 1)].img.h).style.display = 'flex'
    moDautoZoom();
    document.getElementById('zy-info-size').textContent = zys[(num - 1)].img.w + '×' + zys[(num - 1)].img.h;
    document.getElementById('zy-info-channel').textContent = zys[(num - 1)].channel[0];
    document.getElementById('zy-info-game').textContent = userImgData.main.game[0];
}

//修改信息
function setimgMain(type,value,num){
    
    if(type == 'title'){
        var titleNode = document.querySelectorAll('[data-title="'+ (num - 1) + '"]');
        userImgData.main.title[num - 1] = value;
        titleNode.forEach(item => {
            item.innerHTML = value.replace('，','<br>');
        })
    }

    if(type == 'sectitle'){
        var sectitleNode = document.querySelectorAll('[data-sectitle="'+ (num - 1) + '"]');
        userImgData.main.sectitle[num - 1] = value;
        sectitleNode.forEach(item => {
            item.textContent = value;
        })
    }

    if(type == 'fontColor-main'){
        var titleNode = document.querySelectorAll('[data-title]');
        userImgData.style.title.color = value;
        titleNode.forEach(item => {
            item.style.color = value;
        })
    }

    if(type == 'fontColor-sec'){
        var sectitleNode = document.querySelectorAll('[data-sectitle]');
        userImgData.style.sectitle.color = value;
        sectitleNode.forEach(item => {
            item.style.color = value;
        })
    }

    if(type == 'fontFamily-main'){
        var titleNode = document.querySelectorAll('[data-title]');
        userImgData.style.title.fontfamily = value;
        titleNode.forEach(item => {
            item.style.fontFamily = value;
            if(value.split('Source').length > 1){
                item.style.fontWeight = '900'
            }else{
                item.style.fontWeight = '400'
            }
        })
    }

    if(type == 'fontFamily-sec'){
        var sectitleNode = document.querySelectorAll('[data-sectitle]');
        userImgData.style.sectitle.fontfamily = value;
        sectitleNode.forEach(item => {
            item.style.fontFamily = value;
            if(value.split('Source').length > 1){
                item.style.fontWeight = '700'
            }else{
                item.style.fontWeight = '400'
            }
        })
    }

    if(type == 'isGift'){
        var giftNode = document.querySelectorAll('[data-gift="' + (num - 1) + '"]');
        giftNode.forEach(item => {
            if(!value){
                item.style.display = 'none';
                userImgData.main.gift.isview[(num - 1)] = 0;
            }else{
                item.style.display = 'flex';
                userImgData.main.gift.isview[(num - 1)] = 1;
            }
        }) 
    }

    if(type == 'giftname'){
        var giftnameNode = document.querySelectorAll('[data-gift-name="' + (num - 1) + '"]');
        giftnameNode.forEach(item => {
            item.textContent = value;
            userImgData.main.gift.name[(num - 1)] = value;
        })
    }

    if(type == 'giftIcon'){
        var giftIconNode = document.querySelectorAll('[data-gift-icon="' + (num - 1) + '"]');
        var reader = new FileReader();
        reader.readAsDataURL(value);
        reader.onload = (data)=>{
            var dataURL = data.target.result;
            userImgData.main.gift.icon[(num - 1)] = dataURL;
            giftIconNode.forEach(item => {
                item.src = dataURL;
            })
        }
    }

    if(type == 'isGiftTag'){
        var giftTagNode = document.querySelectorAll('[data-tag="' + (num - 1) + '"]');
        if(!value){
            userImgData.main.gift.tagview[(num - 1)] = 0;
        }else{
            userImgData.main.gift.tagview[(num - 1)] = 1;
        }
        giftTagNode.forEach(item => {
            if(!value){
                item.style.display = 'none';
            }else{
                item.style.display = 'flex';
            }
        })
    }

    if(type == 'giftTagNum'){
        var giftTagNumNode = document.querySelectorAll('[data-tag-num="' + (num - 1) + '"]');
        userImgData.main.gift.num[(num - 1)] = value;
        giftTagNumNode.forEach(item => {
            item.innerHTML = value.replace('，','<br>')
        })
    }

    if(type == 'fontFamily-gift'){
        var giftNameNode = document.querySelectorAll('[data-gift-name]');
        var giftTagNode = document.querySelectorAll('[data-tag]');
        userImgData.style.giftname.fontfamily = value;
        userImgData.style.tags.fontfamily = value;
        giftNameNode.forEach(item => {
            item.style.fontFamily = value;
        })
        giftTagNode.forEach(item => {
            item.style.fontFamily = value;
        })
    }

    if(type == 'giftNameColor'){
        var giftNameNode = document.querySelectorAll('[data-gift-name]');
        userImgData.style.giftname.color = value;
        giftNameNode.forEach(item => {
            item.style.color = value;
        })
        giftTagNode.forEach(item => {
            item.style.color = value;
        })
    }

    if(type == 'isGame'){
        var gameNode = document.querySelectorAll('[data-logo-game]');
        if(!value){
            userImgData.main.logoview[0] = 0;
        }else{
            userImgData.main.logoview[0] = 1;
        }
        gameNode.forEach(item => {
            if(!value){
                item.style.display = 'none';
            }else{
                item.style.display = 'flex';
            }
        })
    }

    if(type == 'isChannel'){
        var channelNode = document.querySelectorAll('[data-logo-channel]');
        if(!value){
            userImgData.main.logoview[1] = 0;
        }else{
            userImgData.main.logoview[1] = 1;
        }
        channelNode.forEach(item => {
            if(!value){
                item.style.display = 'none';
            }else{
                item.style.display = 'flex';
            }
        })
    }

    if(type == 'game'){
        var gameNode = document.querySelectorAll('[data-logo-game]');
        userImgData.main.game[0] = value;
        gameNode.forEach(item => {
            item.src = games.filter(items => items.name == value)[0].src[userImgData.main.game[1]];
        })
    }

    if(type == 'channel'){
        var channelNode = document.querySelectorAll('[data-logo-channel]');
        userImgData.main.channel[0] = value;
        channelNode.forEach(item => {
            item.src = channels.filter(items => items.name == value)[0].src[userImgData.main.channel[1]];
        })
    }

    if(type == 'gameTheme'){
        var gameNode = document.querySelectorAll('[data-logo-game]');
        if(!value){
            userImgData.main.game[1] = 1;
        }else{
            userImgData.main.game[1] = 0;
        }
        gameNode.forEach(item => {
            if(!value){
                item.src = games.filter(items => items.name == document.getElementById('game-pick').value)[0].src[1];
            }else{
                item.src = games.filter(items => items.name == document.getElementById('game-pick').value)[0].src[0];
            }
        })
    }

    if(type == 'channelTheme'){
        var channelNode = document.querySelectorAll('[data-logo-channel]');
        if(!value){
            userImgData.main.channel[1] = 1;
        }else{
            userImgData.main.channel[1] = 0;
        }
        channelNode.forEach(item => {
            if(!value){
                item.src = channels.filter(items => items.name == document.getElementById('channel-pick').value)[0].src[1];
            }else{
                item.src = channels.filter(items => items.name == document.getElementById('channel-pick').value)[0].src[0];
            }
        })
    }

    if(type == 'bg'){
        var bgNode = document.querySelectorAll('[data-layout-bg]');
        //console.log(bgNode)
        var reader = new FileReader();
        reader.readAsDataURL(value);
        reader.onload = (data)=>{
            var dataURL = data.target.result;
            userImgData.main.layout.bg_bg.image = dataURL;
            var img = new Image();
            img.src = dataURL;
            img.onload = ()=>{
                var w = img.width;
                var h = img.height;
                userImgData.main.layout.bg_bg.w = w;
                userImgData.main.layout.bg_bg.h = h;
                //console.log(w,h)
                bgNode.forEach(item => {
                    var ww =  item.parentNode.id.split('_')[2].split('-')[0];
                    var hh = item.parentNode.id.split('_')[3].split('-')[0];
                    //console.log(ww,hh,ww/hh,w/h)
                    if(ww/hh > w/h){
                        item.width = ww;
                        item.src = dataURL;
                    } else {
                        item.height = hh;
                        item.src = dataURL;
                    }
                })
            }
        }
    }

    if(type == 'main'){
        var mainNode = document.querySelectorAll('[data-layout-main]');
        var reader = new FileReader();
        reader.readAsDataURL(value);
        reader.onload = (data)=>{
            var dataURL = data.target.result;
            userImgData.main.layout.bg_main.image = dataURL;
            var img = new Image();
            img.src = dataURL;
            img.onload = ()=>{
                var w = img.width;
                var h = img.height;
                userImgData.main.layout.bg_main.w = w;
                userImgData.main.layout.bg_main.h = h;
                mainNode.forEach(item => {
                    var ww =  item.parentNode.id.split('_')[2].split('-')[0];
                    var hh = item.parentNode.id.split('_')[3].split('-')[0];
                    if(ww/hh > w/h){
                        item.height = hh;
                        item.src = dataURL;
                    } else {
                        item.width = ww;
                        item.src = dataURL;
                    }
                })
            }
        }
    }

    
    
}

function reimgClone(){
    cloneImgs();
    appendImg();
    if(window.getComputedStyle(modelView).display !== 'none'){
        imgAutoScale();
    }
}

function cloneImgs(){
    zyClones = []
    //console.log(zyAllId);
    zyAllId.forEach((item,index)=>{
        var cloneImg = document.getElementById(item).cloneNode(true);
        cloneImg.id = cloneImg.id + '-clone';
        cloneImg.style.display = 'flex';
        var scale = 200/cloneImg.id.split('_')[2];
        cloneImg.style.transform = 'scale(' + scale + ')';//先统一缩小到宽度为200
        cloneImg.style.transition = 'transform 0.5s';
        zyClones.push({node:cloneImg,width:cloneImg.id.split('_')[2],height:cloneImg.id.split('_')[3].split('-')[0],scale:scale,name:zyAllname[index],type:userImgData.zy[index].img.type})
    })
    //zyClones = zyClones.sort((a, b) => b.width - a.width).sort((a, b) => b.width * b.height - a.width * a.height);
    //console.log(zyClones)
}

function appendImg(){
    cloneImgView1.innerHTML = '';
    cloneImgView2.innerHTML = '';
    cloneImgView3.innerHTML = '';
    cloneImgView4.innerHTML = '';
    var cloneViews = [cloneImgView1];
    if(window.getComputedStyle(cloneImgView2).display !== 'none'){
        cloneViews = [cloneImgView1,cloneImgView2]
    };
    if(window.getComputedStyle(cloneImgView3).display !== 'none'){
        cloneViews = [cloneImgView1,cloneImgView2,cloneImgView3]
    };
    if(window.getComputedStyle(cloneImgView4).display !== 'none'){
        cloneViews = [cloneImgView1,cloneImgView2,cloneImgView3,cloneImgView4]
    };
    //console.log(zyAllId,cloneImgView1.innerHTML);
    var zyClonsBoxs = []
    zyClones.forEach((item,index) => {
        var cloneImgViewBoxs = document.createElement('div')
        cloneImgViewBoxs.className = 'df-ffc cc ovh cloneimg';

        var imgViewBox = document.createElement('div');
        imgViewBox.className = 'df cc ovh';
        imgViewBox.style.width =  "200px";
        imgViewBox.style.height = item.name.split('×')[1] * item.scale + 'px';
        imgViewBox.style.flex = '0 0 auto'
        //console.log(item.name.split('×')[1] * item.scale)
        imgViewBox.appendChild(item.node);
        
        cloneImgViewBoxs.appendChild(imgViewBox);
        cloneImgViewBoxs.innerHTML += `<div class="wh100 df" ondblclick="exportOne(`+ index +`)" style="align-items: center; padding:10px; height:40px; border-top:1px solid var(--boxBod); background:var(--boxBak); box-sizing: border-box;" >` + item.name + '.' + item.type +` </div>`;
        zyClonsBoxs.push({node:cloneImgViewBoxs,hh:item.name.split('×')[1] * item.scale,});
        //cloneViews[index%cloneViews.length].appendChild(cloneImgViewBoxs);
    })
    zyClonsBoxs = zyClonsBoxs.sort((a, b) => a.hh - b.hh);
    zyClonsBoxs.forEach((item,index) => {
        cloneViews[index%cloneViews.length].appendChild(item.node);
    })
}

function imgAutoScale(){
    zyAllId.forEach((item,index)=>{
        var node = document.getElementById(item + '-clone');
        var scale = node.parentNode.parentNode.offsetWidth/item.split('_')[2];
        if(scale < 0.1){scale = 0.1};
        if(scale > 1.5){scale = 1.5}
        node.parentNode.style.width = item.split('_')[2] * scale + 'px';
        node.parentNode.style.height = item.split('_')[3] * scale + 'px';
        node.style.transform = 'scale(' + scale + ')';
    })
}

function addFontStyle(){
    var allFont = `
    <option value="FZYaSongS-B-GB">方正粗雅宋</option>
    <option value="FZJinLS-B-GB">方正粗金陵</option>
    <option value="FZShengShiKaiShuS-EB-GB">方正盛世楷书</option>
    <option value="HYXiaoLiShuJ">汉仪小隶书</option>
    <option value="Aa诗宋体">Aa诗宋体</option>
    <option value="AaJianHaoTi">Aa剑豪体</option>
    <option value="临海体">临海隶书</option>
    <option value="三极泼墨体">三极泼墨体</option>
    <option value="SJsanjililiangtijian-cu">三极力量体简</option>
    <option value="PangMenZhengDao">庞门正道标题体</option>
    <option value="CKTKingKong">创客贴金刚体</option>
    <option value="ZhenyanGB">锐字真言体</option>
    <option value="LogoSC Unbounded Sans">标小智无界黑</option>
    <option value="HYDiWRGJ">汉仪第五人格简</option>
    <option value="Hangyaku">叛逆明朝</option>
    `
    var fontSelect = document.querySelectorAll('[data-font-style]');
    fontSelect.forEach(item => {
        item.innerHTML = allFont;
    })
}

function addGame(){
    games.forEach(item => {
        var node = document.createElement('option')
        node.value = item.name;
        node.innerHTML = item.name;
        document.getElementById('game-pick').appendChild(node)
    })
    channels.forEach(item => {
        var node = document.createElement('option')
        node.value = item.name;
        node.innerHTML = item.name;
        document.getElementById('channel-pick').appendChild(node)
    })
}
//导出
var dataurls = [];
async function exportAll(){
    
    if(zyAllId.length == 1){//单个导出
        exportOne(0);
    }else{
        dataurls = [];
        for(var i = 0; i < zyAllId.length; i++){
            exportOne(i,true)
            //exportOne(i)
        }
    }
    }
    

async function exportOne(e,isAll){
    var id = zyAllId[e];
    var zyType = userImgData.zy[e].img.type;
    var w = userImgData.zy[e].img.w;
    var h = userImgData.zy[e].img.h
    var zyName = 'img' ;
    var zyNode = document.getElementById(id + '-clone');
    //zyNode.parentNode.style.filter = 'blur(10px)';
    //zyNode.parentNode.style.transition = 'filter 0.5s';
    zyNode.parentNode.parentNode.className = 'df-ffc cc ovh cloneimg downing';
    if (zyType == 'png'){
        zyNode.style.transform = 'scale(1)';
    } else {
        zyNode.style.transform = 'scale(' + (w + 12)/w  + ')';
    }

    

    if(zyAllname.length > 0){
        zyName = zyAllname[e]
    }
    if(isAll){
        exportOneAs(zyNode,zyType,zyName,w,h,e,true)
    }else{
        exportOneAs(zyNode,zyType,zyName,w,h,e)
        tipsAll('后台正在创建下载，请耐心等待~',3000)
    }
    
}

async function exportOneAs(node,type,name,w,h,e,isAll){
    /* toJpeg(node,{quality:number}) | toPng(node) | toPixelData(node).then(function(pixels){} | toBlob(node)*/
    if(type == 'jpeg' || type == 'jpg' || type == 'webp'){
        setTimeout(()=>{
            domtoimage.toJpeg(node, { quality: 0.9,with:w,height:h})
            .then(function (dataUrl) {
                if(isAll){
                    dataurls.push(dataURLtoBlob(dataUrl));
                    if(dataurls.length == zyAllId.length){
                        //console.log(dataurls)
                        createZipAndDownload(dataurls)
                    }
                }else{
                    var link = document.createElement('a');
                    link.download = name + '.jpg';
                    link.href = dataUrl;
                    link.click();
                    link.remove();
                }
            });
            setTimeout(()=>{
                //node.parentNode.style.filter = '';
                node.parentNode.parentNode.className = 'df-ffc cc ovh cloneimg'
                //if(e == zyAllId.length - 1){
                    imgAutoScale();  
                //}
            },500)
        },500)
    }
    if(type == 'png' || type == 'gif'){
        setTimeout(()=>{
            domtoimage.toPng(node, { quality: 1,with:w,height:h})
            .then(function (dataUrl) {
                if(isAll){
                    dataurls.push(dataURLtoBlob(dataUrl));
                    if(dataurls.length == zyAllId.length){
                        //console.log(dataurls)
                        createZipAndDownload(dataurls)
                    }
                }else{
                    var link = document.createElement('a');
                    link.download = name + '.png';
                    link.href = dataUrl;
                    link.click();
                    link.remove();
                }
            });
            setTimeout(()=>{
                //node.parentNode.style.filter = '';
                node.parentNode.parentNode.className = 'df-ffc cc ovh cloneimg'
                //if(e == zyAllId.length - 1){
                    imgAutoScale();
                //}
            },500)
        },500)
    }
    
}

// 创建ZIP文件并提供下载
function createZipAndDownload(compressedImages) {
    var MN = new Date()
    var M = String(MN.getMonth() + 1).padStart(2, '0');
    var N = String(MN.getDate()).padStart(2, '0');
    var HHMMSS = String(MN.getHours()).padStart(2, '0') + String(MN.getMinutes()).padStart(2, '0') + String(MN.getSeconds()).padStart(2, '0');
    var zip = new JSZip();


    compressedImages.forEach((blob,index) => {
        var path = zyAllname[index].split('/');
        var name = path.pop() + '.' + userImgData.zy[index].img.type;
        if (zyAllname[index].split('/').length == 2) {
            var folder = zip.folder(path[0]);
            folder.file(name,blob);
        } else if (zyAllname[index].split('/').length == 3) {
            var folder1 = zip.folder(path[0]);
            var folder2 = folder1.folder(path[1]);
            folder2.file(name,blob);
        } else {
            zip.file(name,blob);
        }
        });

    zip.generateAsync({ type: "blob" }).then(function (content) {
        saveAs(content,'【' + userImgData.main.game[0] + '】' + userImgData.main.title[0].replace('，','_') + ' ' + M + N + '_' + HHMMSS + '.zip');
    });
}

 function dataURLtoBlob(dataURL) {
    // 按逗号分隔Data URL
    var parts = dataURL.split(',');
    // 获取MIME类型
    var mime = parts[0].match(/:(.*?);/)[1];
    // 解码Base64数据
    var bstr = atob(parts[1]);
    // 创建Uint8Array
    var n = bstr.length;
    //console.log(n)
    var u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    // 创建Blob对象
    return new Blob([u8arr], { type: mime });
}

async function toCanvasData(){
    
}