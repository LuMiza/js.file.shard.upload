/**
 * @description 文件分片上传
 * @author Rumble
 * @date 2018-11-20
 */
(function (window) {
    var $File = window.$File = function(option) {
        return  new $File.prototype.init(option);
    };

    var current_file = null,//当前文件对象
        total_shard= 0,//总分片
        current_shard = 0,//当前分片
        ajax = new XMLHttpRequest(),//ajax对象
        form = new FormData,//表单对象
        start = 0,//分片起始字节
        shard_size =1024 * 1024;//1M
    var end = start + shard_size;//分片结束字节
    var this_args;


    /**
     * 文件分片
     * @param file
     * @returns {*}
     */
    function shard(file)
    {
/*        var file_blob = file.slice(start, end);
        start = end;
        end = start + shard_size;
        current_shard += 1;
        return file_blob;*/
        if (end >= current_file.size) {
            end = current_file.size;
        }
        var file_blob = file.slice(start, end);
        start = end;
        end = start + shard_size;
        current_shard += 1;
        return file_blob;
    }

    /**
     * 将数据发送服务端
     * @param blob
     */
    function sendData(blob){
        if (typeof this_args.name != 'undefined') {
            form.append(this_args.name,blob);
        } else {
            form.append('file',blob);
        }
        form.append('blob_num',current_shard);
        form.append('total_blob_num',total_shard);
        form.append('file_name',current_file.name);

        if ((typeof this_args.data != 'undefined') && (typeof this_args.data == 'object')) {
            for (var key in this_args.data) {
                form.append(key, this_args.data[key]);
            }
        }

        ajax.open('POST',this_args.url,false);
        ajax.send(form);
        ajax.onreadystatechange  = function () {
            if (ajax.readyState==4 && ajax.status==200) {
                //步骤五 如果能够进到这个判断 说明 数据 完美的回来了,并且请求的页面是存在的
                console.log(ajax.responseText);//服务器端返回数据
                console.log('success');
                if (total_shard == current_shard) {
                    console.log('上传成功');
                }
            }
        }
        if (typeof this_args.name != 'undefined') {
            form.delete(this_args.name);
        } else {
            form.delete('file');
        }
        form.delete('blob_num');
        form.delete('total_blob_num');
        form.delete('file_name');
        if ((typeof this_args.data != 'undefined') && (typeof this_args.data == 'object')) {
            for (var key in this_args.data) {
                form.delete(key);
            }
        }
    }

    /**
     * 文件传输完毕 将某些数据恢复为默认初始值
     */
    function initData() {
        total_shard= 0;
        current_shard = 0;
        start = 0;
        end = start + shard_size;
        current_file.value = '';
    }


    $File.prototype = {
        options: null,
        init: function (option) {
            if (typeof option != 'undefined') {
                this.options = this_args  = option;
            }
            return this;
        },
        /**
         * 文件上传
         */
        upload: function(){
            var _this = this;
            if (typeof _this.options.file == 'undefined') {
                throw new Error('$File options.file undefined, must object!');
            }
            if (typeof _this.options.url == 'undefined') {
                throw new Error('$File options.url undefined');
            }
            current_file = _this.options.file.files[0];
            total_shard = Math.ceil(current_file.size / shard_size);
            while (start < current_file.size) {
                sendData(shard(current_file));
            }
            if (start >= current_file.size) {
                initData();
            }
        }
    };

    $File.prototype.init.prototype = $File.prototype;


})(window);