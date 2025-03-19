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
        node.innerHTML = `
        <input type="checkbox" id="model-pick-` + index + `" style="display: none;" 
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
    node.innerHTML = `<div style="opacity:0.5;">更多需要</div><div style="opacity:0.5;">请联系定制~<div>`;
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
                }else {
                    fontsizes =  userImgData.public.fontsize[index];
                    if (info[1] == 0){
                        fontsizes =  userImgData.public.fontsize[index + 1];
                    }
                    if (info[2] == 1 || info[4] == 1){
                        fontsizes =  userImgData.public.fontsize[index - 1];
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
                } else {
                    fontsizes =  userImgData.public.fontsize[index];
                    if (info[1] == 0){
                        fontsizes =  userImgData.public.fontsize[index + 1];
                    }
                    if (info[2] == 1 || info[4] == 1){
                        fontsizes =  userImgData.public.fontsize[index - 1];
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
        font-family:'` + userImgData.style.title.fontfamily + `';
        font-weight: 900;" 
        data-title="0">`
         + userImgData.main.title[0].replace('，','<br>') +
        `</div>`;
    };
    if (info[1] == 1) {
        sectitleNode = `<div 
        style="font-size: ` + fontsizes[1] + `px; 
        line-height:` + fontsizes[1] + `px; 
        color:` + userImgData.style.sectitle.color + `;
        font-family:'` + userImgData.style.sectitle.fontfamily + `';
        font-weight: 700;" 
        data-sectitle="0">` 
        + userImgData.main.sectitle[0].replace('，','<br>') +
        `</div>`;
    };
    if(info[2] == 1){
        giftNode = `
        <div class="cc w100" style="gap:` + fontsizes[1] + `px;">
            <div class="pos-r df-ffc cc" style="width:` + fontsizes[2]*1.5 + `px; box-sizing: border-box; ">
                <div class="gift-box pos-r cc" style="width:` + fontsizes[2]*1.5 + `; height:` + fontsizes[2]*1.5 + `; padding:` + fontsizes[0]*0.5 + `px;">
                    <div class="gift-tag pos-a df cc" style="font-size: ` + fontsizes[0]*0.8 + `px; padding:` + fontsizes[0]*0.2 + `px;
                    color:` + userImgData.style.tags.color + `;
                    font-family:'` + userImgData.style.tags.fontfamily + `';
                    font-weight: 400;" >
                        <div data-tag-before="0"></div>
                        <div data-tag-num="0">`+ userImgData.main.gift.num[0] +`</div>
                        <div data-tag-after="0"></div>
                    </div>
                    <img data-gift-icon="0" class="w100" src="` + userImgData.main.gift.icon[0] + `">
                </div>
                <div class="gift-name-box">
                    <div data-gift-name="0" style="font-size: ` + fontsizes[0] + `px; 
                    color:` + userImgData.style.giftname.color + `;
                    font-family:'` + userImgData.style.giftname.fontfamily + `';
                    font-weight: 400;" >`
                    + userImgData.main.gift.name[0] +
                    `</div>
                </div>  
            </div>

            <div class="pos-r df-ffc cc" style="width:` + fontsizes[2]*1.5 + `px; box-sizing: border-box; ">
                <div class="gift-box pos-r cc" style="width:` + fontsizes[2]*1.5 + `; height:` + fontsizes[2]*1.5 + `; padding:` + fontsizes[0]*0.5 + `px;">
                    <div class="gift-tag pos-a df cc" style="font-size: ` + fontsizes[0]*0.8 + `px; padding:` + fontsizes[0]*0.2 + `px;
                    color:` + userImgData.style.tags.color + `;
                    font-family:'` + userImgData.style.tags.fontfamily + `';
                    font-weight: 400;" >
                        <div data-tag-before="1"></div>
                        <div data-tag-num="1">`+ userImgData.main.gift.num[1] +`</div>
                        <div data-tag-after="1"></div>
                    </div>
                    <img data-gift-icon="1" class="w100" src="` + userImgData.main.gift.icon[1] + `">
                </div>
                <div class="gift-name-box">
                    <div data-gift-name="1" style="font-size: ` + fontsizes[0] + `px; 
                    color:` + userImgData.style.giftname.color + `;
                    font-family:'` + userImgData.style.giftname.fontfamily + `';
                    font-weight: 400;" >`
                    + userImgData.main.gift.name[1] +
                    `</div>
                </div>  
            </div>

            <div class="pos-r df-ffc cc" style="width:` + fontsizes[2]*1.5 + `px; box-sizing: border-box; ">
                <div class="gift-box pos-r cc" style="width:` + fontsizes[2]*1.5 + `; height:` + fontsizes[2]*1.5 + `; padding:` + fontsizes[0]*0.5 + `px;">
                    <div class="gift-tag pos-a df cc" style="font-size: ` + fontsizes[0]*0.8 + `px; padding:` + fontsizes[0]*0.2 + `px;
                    color:` + userImgData.style.tags.color + `;
                    font-family:'` + userImgData.style.tags.fontfamily + `';
                    font-weight: 400;" >
                        <div data-tag-before="2"></div>
                        <div data-tag-num="2">`+ userImgData.main.gift.num[2] +`</div>
                        <div data-tag-after="2"></div>
                    </div>
                    <img data-gift-icon="2" class="w100" src="` + userImgData.main.gift.icon[2] + `">
                </div>
                <div class="gift-name-box">
                    <div data-gift-name="2" style="font-size: ` + fontsizes[0] + `px; 
                    color:` + userImgData.style.giftname.color + `;
                    font-family:'` + userImgData.style.giftname.fontfamily + `';
                    font-weight: 400;" >`
                    + userImgData.main.gift.name[2] +
                    `</div>
                </div>  
            </div>

            <div class="pos-r df-ffc cc" style="width:` + fontsizes[2]*1.5 + `px; box-sizing: border-box; ">
                <div class="gift-box pos-r cc" style="width:` + fontsizes[2]*1.5 + `; height:` + fontsizes[2]*1.5 + `; padding:` + fontsizes[0]*0.5 + `px;">
                    <div class="gift-tag pos-a df cc" style="font-size: ` + fontsizes[0]*0.8 + `px; padding:` + fontsizes[0]*0.2 + `px;
                    color:` + userImgData.style.tags.color + `;
                    font-family:'` + userImgData.style.tags.fontfamily + `';
                    font-weight: 400;" >
                        <div data-tag-before="3"></div>
                        <div data-tag-num="3">`+ userImgData.main.gift.num[3] +`</div>
                        <div data-tag-after="3"></div>
                    </div>
                    <img data-gift-icon="3" class="w100" src="` + userImgData.main.gift.icon[3] + `">
                </div>
                <div class="gift-name-box">
                    <div data-gift-name="3" style="font-size: ` + fontsizes[0] + `px; 
                    color:` + userImgData.style.giftname.color + `;
                    font-family:'` + userImgData.style.giftname.fontfamily + `';
                    font-weight: 400;" >`
                    + userImgData.main.gift.name[3] +
                    `</div>
                </div>  
            </div>
            

        </div>`
    };
    
    if(userImgData.main.layout.bg_main.image){
        mainLayout = '<img width="100%" height="100" src="" data-layout-main/>'
    };
    if(userImgData.main.layout.bg_bg.image){
        bgLayout = '<img width="100%" height="100" src="" data-layout-bg/>'
    };

    node.id = imgid;
    node.style.width = w + 'px';
    node.style.height = h + 'px';
    node.style.flex = '0,0,auto';
    node.className = 'ovh pos-r zySSS';

    node.innerHTML = `
    <div class="cc df-ffc pos-a-cc w100" data-info style="gap:` + fontsizes[0]*0.8 + `px">
    `+ titleNode + sectitleNode + giftNode +`
    </div>
    <img width="`+ (Math.min(w,h) - Math.min(w,h)/10) +`px" src="https://cdn.jsdelivr.net/gh/YNYU01/listEase@1ba86723ad86e7a244ed6ef8404e4a903784bcfc/img/Icon-ListEase_200-5.png" class="pos-a-cc"  style="opacity: 0.1; filter: brightness();"/>
    ` + mainLayout + bgLayout


}

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

function setimgMain(type,value,num){
    
    var title1 = document.querySelectorAll('[data-title="0"]');
    var title2 = document.querySelectorAll('[data-title="1"]');
    var sectitle1 = document.querySelectorAll('[data-sectitle="0"]');
    var sectitle2 = document.querySelectorAll('[data-sectitle="1"]');
    var giftname1 = document.querySelectorAll('[data-title="0"]');
    var giftname2 = document.querySelectorAll('[data-title="1"]');
    var giftname3 = document.querySelectorAll('[data-sectitle="0"]');
    var giftname4 = document.querySelectorAll('[data-sectitle="1"]');

    if((type + num) == 'title1'){
        userImgData.main.title[0] = value;
        title1.forEach(item => {
            item.innerHTML = value.replace('，','<br>');
        })
    }
    if((type + num) == 'title2'){
        userImgData.main.title[1] = value;
        title2.forEach(item => {
            item.textContent = value.replace('，','<br>');
        })
    }
    if((type + num) == 'sectitle1'){
        userImgData.main.sectitle[0] = value;
        sectitle1.forEach(item => {
            item.textContent = value;
        })
    }
    if((type + num) == 'sectitle2'){
        userImgData.main.sectitle[1] = value;
        sectitle2.forEach(item => {
            item.textContent = value;
        })
    }
    if(type == 'fontColor-main'){
        userImgData.style.title.color = value;
        title1.forEach(item => {
            item.style.color = value;
        })
        title2.forEach(item => {
            item.style.color = value;
        })
    }
    if(type == 'fontColor-sec'){
        userImgData.style.sectitle.color = value;
        sectitle1.forEach(item => {
            item.style.color = value;
        })
        sectitle2.forEach(item => {
            item.style.color = value;
        })
    }
    if(type == 'fontFamily-main'){
        userImgData.style.title.fontfamily = value;
        title1.forEach(item => {
            item.style.fontFamily = value;
        })
        title2.forEach(item => {
            item.style.fontFamily = value;
        })
    }
    if(type == 'fontFamily-sec'){
        userImgData.style.sectitle.fontfamily = value;
        sectitle1.forEach(item => {
            item.style.fontFamily = value;
        })
        sectitle2.forEach(item => {
            item.style.fontFamily = value;
        })
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
        cloneImgViewBoxs.innerHTML += `<div class="wh100 df" style="align-items: center; padding:10px; height:40px; border-top:1px solid var(--boxBod); background:var(--boxBak); box-sizing: border-box;" >` + item.name + '.' + item.type +` </div>`;
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

//导出
async function exportAll(){
    zyAllId.forEach((item,index)=>{
        var node = document.getElementById(item + '-clone');
        node.parentNode.style.filter = 'blur(10px)';
        node.parentNode.style.transition = 'filter 0.5s';
        node.parentNode.parentNode.className = 'df-ffc cc ovh cloneimg downing'
        node.style.transform = 'scale(1)';
        exportOne(index);
        setTimeout(()=>{        
            node.parentNode.style.filter = '';
            node.parentNode.parentNode.className = 'df-ffc cc ovh cloneimg'
        },1000 * (zyAllId.length - index))
        if(index == zyAllId.length - 1){
            imgAutoScale();
        }
    });
    //imgAutoScale();
}

async function exportOne(e){
    var w = userImgData.zy[e].img.w;
    var h = userImgData.zy[e].img.h
    var imgid = 'zy_' + (e + 1) + '_' + w + '_' + h + '-clone';
    var zyNode = document.getElementById(imgid);
    //console.log(zyNode)
    var zyType = userImgData.zy[e].img.type;
    var zyName = 'img' 
    if(zyAllname.length > 0){
        zyName = zyAllname[e]
    }
    exportOneAs(zyNode,zyType,zyName,w,h)

}

async function exportOneAs(node,type,name,w,h){
    var display = true;
    if(node.style.display == 'none'){
        display = false;
        node.style.display = 'block';
    }
    
    /* toJpeg(node,{quality:number}) | toPng(node) | toPixelData(node).then(function(pixels){} */
    if(type == 'jpeg' || type == 'jpg' || type == 'webp'){
        setTimeout(()=>{
            domtoimage.toJpeg(node, { quality: 1,with:w,height:h})
            .then(function (dataUrl) {
                var link = document.createElement('a');
                link.download = name + '.jpg';
                link.href = dataUrl;
                link.click();
            });
            setTimeout(()=>{
                if(!display){
                    node.style.display = 'none'
                }
            },500)
        },500)
    }
    if(type == 'png' || type == 'gif'){
        setTimeout(()=>{
            domtoimage.toPng(node, { quality: 1,with:w,height:h})
            .then(function (dataUrl) {
                var link = document.createElement('a');
                link.download = name + '.png';
                link.href = dataUrl;
                link.click();
            });
            setTimeout(()=>{
                if(!display){
                    node.style.display = 'none'
                }
            },500)
        },500)
    }
}

