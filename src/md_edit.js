const modelFlow = document.getElementById('model-flow');
const modelList = document.getElementById('model-list');
const modelView = document.getElementById('model-view');
const modelData = document.getElementById('model-data');
const modelMain = document.getElementById('model-main');
const modelTable = document.getElementById('model-table');
const selectZY = document.getElementById('select-zy');
const cloneImgView1 = document.getElementById('cloneImg-view-1');
const cloneImgView2 = document.getElementById('cloneImg-view-2');
const cloneImgView3 = document.getElementById('cloneImg-view-3');
const cloneImgView4 = document.getElementById('cloneImg-view-4');
var exportAllname = '';
var zyAllname = [];
var zyAllId = [];

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
        setImgLayout(imgnode,imgid,item.img)
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
    cloneImg();
}

 function setImgLayout(node,imgid,imgInfo){
    var w = imgInfo.w, h = imgInfo.h, type = imgInfo.type, safa = imgInfo.safa , info = imgInfo.info;
    var fontsizes = [0,0,0];
    var ww = w, hh = h
    //console.log(111)
    if(safa && safa[0]){
        ww = safa[0][2];
        hh = safa[0][3];
        //console.log(222)
    }
    if(ww > hh){
        var findW = userImgData.public.framesize.ww.map(item => Math.abs(hh - item) )
        findW.forEach((item,index) => {
            if(item == Math.min(...findW)){
                console.log(ww,hh,findW,userImgData.public.fontsize[index])
                if((index - 1) < 0){
                    fontsizes =  userImgData.public.fontsize[0]
                }else {
                    fontsizes =  userImgData.public.fontsize[index]
                }
                
            }
        })
    } else {
        var findH = userImgData.public.framesize.hh.map(item => Math.abs(ww - item) )
        
        findH.forEach((item,index) => {
            if(item == Math.min(...findH)){
                console.log(ww,hh,findH,userImgData.public.fontsize[index])
                if((index - 1) < 0){
                    fontsizes =  userImgData.public.fontsize[0]
                } else {
                    fontsizes =  userImgData.public.fontsize[index]
                }
                
            }
        })
    }

    if(type != 'png'){
        node.style.background = 'var(--boxGry)';
    }
    
    var titleNode = '',sectitleNode = '';
    if (info[0] == 1) {
        titleNode = `<div 
        id="` + imgid +`-title" 
        style="font-size:` + fontsizes[2] + `px; 
        color:` + userImgData.style.title.color + `;
        font-family:'` + userImgData.style.title.fontfamily + `';
        font-weight: 900;" 
        data-title="0">`
         + userImgData.main.title[0].replace('，','<br>') +
        `</div>`;
    }
    if (info[1] == 1) {
        sectitleNode = `<div 
        id="` + imgid +`-sectitle" 
        style="font-size: ` + fontsizes[1] + `px; 
        color:` + userImgData.style.title.color + `;
        font-family:'` + userImgData.style.sectitle.fontfamily + `';
        font-weight: 700;" 
        data-sectitle="0">` 
        + userImgData.main.sectitle[0].replace('，','<br>') +
        `</div>`;
    }
    
    node.id = imgid;
    node.style.width = w + 'px';
    node.style.height = h + 'px';
    node.style.flex = '0,0,auto';
    node.className = 'ovh pos-r zySSS';

    node.innerHTML = `
    <div class="cc df-ffc pos-a-cc w100" style=" position: absolute;">
    `+ titleNode + sectitleNode +`
    </div>
    <img width="`+ (Math.min(w,h) - Math.min(w,h)/10) +`px" src="img/Icon-ListEase_200-5.png" class="pos-a-cc"  style="opacity: 0.1; filter: brightness();"/>
    `


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
    var title = []
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
        userImgData.style.title.fontFamily = value;
        title1.forEach(item => {
            item.style.fontFamily = "\'" + value + "\'";
        })
        title2.forEach(item => {
            item.style.fontFamily = "\'" + value + "\'";
        })
    }
    if(type == 'fontFamily-sec'){
        userImgData.style.sectitle.fontFamily = value;
        sectitle1.forEach(item => {
            item.style.fontFamily = "\'" + value + "\'";
        })
        sectitle2.forEach(item => {
            item.style.fontFamily = "\'" + value + "\'";
        })
    }
    
}


function cloneImg(){
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

    zyAllId.forEach((item,index)=>{
        var cloneImgViewBoxs = document.createElement('div')
        cloneImgViewBoxs.style.width = "100%";
        cloneImgViewBoxs.style.background = "var(--boxGry)";
        cloneImgViewBoxs.className = 'df-ffc';
        
        //console.log(window.getComputedStyle(document.getElementById(item)).width)
        var cloneImg = document.getElementById(item).cloneNode(true);
        if(cloneImg.id){
            cloneImg.id = cloneImg.id + '-clone';
        }
        cloneImg.style.display = 'flex';
        //console.log((modelData.offsetWidth - 30)/cloneViews.length)
        var imgW = (modelData.offsetWidth - 30)/cloneViews.length;
        cloneImg.style.transform = 'scale(' + imgW/window.getComputedStyle(document.getElementById(item)).width.split('px')[0] + ')';
        var imgViewBox = document.createElement('div');
        imgViewBox.className = 'df cc ovh';
        imgViewBox.style.width =  imgW + "px";
        imgViewBox.style.height = window.getComputedStyle(document.getElementById(item)).height.split('px')[0] * imgW/window.getComputedStyle(document.getElementById(item)).width.split('px')[0] + 'px';
        imgViewBox.appendChild(cloneImg);
        
        cloneImgViewBoxs.appendChild(imgViewBox);
        cloneImgViewBoxs.innerHTML += `<div>` + zyAllname[index] +` </div>`;
        cloneViews[index%cloneViews.length].innerHTML = '';
        cloneViews[index%cloneViews.length].appendChild(cloneImgViewBoxs);
    })

    

}

//导出
async function exportAll(){
    imgViewBox.style.transform = 'scale(1)';
    var zys = userImgData.zy;
    for(var i = 0; i < zys.length; i++){
        exportOne(i)
        if( i == zys.length - 1){
            setTimeout(()=>{
                imgViewBox.style.transform = 'scale('+ zoom/100 +')';
            },1000)
        }
    }
}

async function exportOne(e){
    var w = userImgData.zy[e].img.w;
    var h = userImgData.zy[e].img.h
    var imgid = 'zy_' + (e + 1) + '_' + w + '_' + h;
    var zyNode = document.getElementById(imgid);
    //console.log(zyNode)
    var zyType = userImgData.zy[e].img.type;
    var zyName = 'img' 
    if(zyAllname.length > 0){
        zyName = zyAllname[e]
    }
    var svgElem = [...zyNode.querySelectorAll('image'),...zyNode.querySelectorAll('img')];
    //console.log(svgElem)
    if(svgElem && svgElem.length > 0){
        svgElem.forEach(function(node,index) {
            var href = node.getAttributeNS("http://www.w3.org/1999/xlink", "xlink:href");
            if(!href){
                href = node.getAttribute('xlink:href');
                if(!href){
                    href = node.src
                    //console.log(href)
                }
            }
            if (href.split('/').length > 1){
                //console.log('链接',node.id)
                // 使用fetch获取图片
                fetch(href)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.blob();
                })
                .then(blob => {
                    var reader = new FileReader();
                    reader.onloadend = async function() {
                        var dataURL = reader.result;
                        //await node.setAttribute("href", dataURL);
                        await node.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', dataURL );
                        if(index == svgElem.length - 1){
                            exportOneAs(zyNode,zyType,zyName,w,h)
                        }
                    };
                    reader.readAsDataURL(blob);
                })
                .catch(error => console.error('Error loading image:', error));
            }else{
                if(index == svgElem.length - 1){
                    exportOneAs(zyNode,zyType,zyName,w,h)
                }
            }
            
            
        });
    }else{
        exportOneAs(zyNode,zyType,zyName,w,h)
    }

}

async function exportOneAs(node,type,name,w,h){
    var display = true;
    if(node.style.display == 'none'){
        display = false;
        node.style.display = 'block';
    }
    
    /* toJpeg(node,{quality:number}) | toPng(node) | toPixelData(node).then(function(pixels){} */
    if(type == 'jpeg' || type == 'jpg'){
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
    if(type == 'png'){
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

/*---------------自定义节点----------------------*/

//有限字数文案节点
function limitedString() {
    this.addOutput("string", "string");
    this.addProperty("value", "",);//name, default_value,type,extra_info
    this.widget = this.addWidget("text","Text","","value");  //link to property value
    this.widgets_up = true;
    this.size = [180, 30];
}

limitedString.title = "文案";
limitedString.desc = "输入带限定字数的文案";

limitedString.prototype.setValue = function(v){this.setProperty("value",v)}

limitedString.prototype.onExecute = function() {
    this.setOutputData(0, this.properties["value"]);     
};

LiteGraph.registerNodeType("imginfo/string", limitedString);


//基础信息节点
function ImgInfoMain() {
    this.addInput("主标题", "string"); // 主标题输入端口
    this.addInput("副标题", "string"); // 副标题输入端口
    this.addOutput("输出","string")
    this.size = [180, 100];
}

ImgInfoMain.title = "配置项（基础）";
ImgInfoMain.desc = "接收主标题和副标题信息";

ImgInfoMain.prototype.onExecute = function () {
    var mainTitle = this.getInputData(0); // 主标题
    var subTitle = this.getInputData(1); // 副标题
    this.setOutputData(0,"[" + mainTitle + "," + subTitle + "]") 
};

ImgInfoMain.prototype.setValue = function(v){this.setProperty("value",v)}


LiteGraph.registerNodeType("imginfo/main", ImgInfoMain);

 

/*---------------从数据生成节点----------------------*/

function addFlowEditor(userImgData){
    
    var graph = new LGraph();   
    var canvas = new LGraphCanvas("#model-flow", graph);
    canvas.show_info = false;
    graph.start()

    //示例数据
    var node_input1 = LiteGraph.createNode("imginfo/string","文案");
    node_input1.pos = [200,200];
    node_input1.setValue("示例文案") 
    graph.add(node_input1);


    var node_input3 = LiteGraph.createNode("imginfo/main");
    node_input3.pos = [500,200];
    graph.add(node_input3);

    var node_input2 = LiteGraph.createNode("imginfo/string");
    node_input2.pos = [200,300];
    node_input2.setValue("示例文案") 
    graph.add(node_input2);

    node_input1.connect(0, node_input3, 0 );
    node_input2.connect(0, node_input3, 1 );

}
