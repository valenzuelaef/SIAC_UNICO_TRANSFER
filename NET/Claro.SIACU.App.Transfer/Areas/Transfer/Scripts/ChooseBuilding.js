(function ($, undefined) {

    'use strict';

    var Form = function ($element, options) {
        $.extend(this, $.fn.FormChooseBuilding.defaults, $element.data(), typeof options === 'object' && options);

        this.setControls({
            form: $element,
            tblBuilding: $('#tblBuilding', $element)
        });
    }

    Form.prototype = {
        constructor: Form,

        init: function () {
            var that = this;
            var controls = this.getControls();
            that.render();
        },

        render: function () {
            var that = this;
            var controls = this.getControls();
            that.loadPlansDataTable();
        },

        getControls: function () {
            return this.m_controls || {};
        },

        setControls: function (value) {
            this.m_controls = value;
        },

        loadPlansDataTable: function () {
            var that = this;
            var controls = that.getControls();


            var dataBuilding = [];
            var urlBase = '/Transfer/Home/GetEdificios';
            $.app.ajax({
                type: 'POST',
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                url: urlBase,
                async:true,
                success: function (response) {
                    
                    if (response.data) {
                    $.each(response.data, function (index, value)  {
                        
                        var feed =
                   {
                                strIdBuilding: value.CodEdi,
                                strDescription: "NODO",
                                strDistrict: value.NomDst,
                                strCenterPopulated: value.DistDesc
                            };

                        dataBuilding.push(feed);

                    });
                   }

            controls.tblBuilding.DataTable({
                "pagingType": "full_numbers",
                "scrollY": "200px",
                "scrollCollapse": true,
                "processing": true,
                "serverSide": false,
                "paging": true,
                "pageLength": 10,
                "destroy": true,
                "searching": false,
                "language": {
                    //"lengthMenu": "Mostrar _MENU_ registros por página.",
                    "zeroRecords": "No existen datos",
                    "loadingRecords": "&nbsp;",
                    //"processing": "<img src=" + that.strUrlLogo + " width='25' height='25' /> Cargando ... </div>",
                    "info": " ",
                    "infoEmpty": " ",
                    "infoFiltered": "(filtered from _MAX_ total records)",
                    "search": "Busqueda General",
                    "oPaginate": {
                        "sFirst": "Primero",
                        "sPrevious": "Anterior",
                        "sNext": "Siguiente",
                        "sLast": "Último"
                    },
                    "emptyTable": "No existen datos"
                },
                        "data": dataBuilding,
                "columns": [
                    { "orderable": false, "data": null, className: "select-radio", "defaultContent": "", render: function (data) { return "&nbsp"; } },
                    { "orderable": true, order: "asc", "data": "strIdBuilding" },
                    { "data": "strDescription" },
                    { "data": "strDistrict" },
                    { "data": "strCenterPopulated" }
                ],
                "bLengthChange": false,
                select: {
                    style: 'os',
                    info: false
                }
            });


                }
            });
 

        }
    }

    $.fn.FormChooseBuilding = function () {
        var option = arguments[0],
            args = arguments,
            value,
            allowedMethods = [];

        this.each(function () {
            var $this = $(this),
                data = $this.data('FormChooseBuilding'),
                options = $.extend({}, $.fn.FormChooseBuilding.defaults,
                    $this.data(), typeof option === 'object' && option);

            if (!data) {
                data = new Form($this, options);
                $this.data('FormChooseBuilding', data);
            }

            if (typeof option === 'string') {
                if ($.inArray(option, allowedMethods) < 0) {
                    throw "Unknown method: " + option;
                }
                value = data[option](args[1]);
            } else {
                data.init();
                if (args[1]) {
                    value = data[args[1]].apply(data, [].slice.call(args, 2));
                }
            }
        });

        return value || this;
    };

    $.fn.FormChooseBuilding.defaults = {
    }

    $('#ChooseBuilding', $('.modal:last')).FormChooseBuilding();

})(jQuery, null);