(function ($, undefined) {

    'use strict';

    var Form = function ($element, options) {
        $.extend(this, $.fn.FormChoosePlane.defaults, $element.data(), typeof options === 'object' && options);

        this.setControls({
            form: $element,
            tblPlane: $('#tblPlane', $element)
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
            var dataPlane = [];
            that.loadPlano(dataPlane, "Cargando...");
            var urlBase = '/Transfer/Home/GetPlanos';
            $.app.ajax({
                type: 'POST',
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                url: urlBase,
                async:true,
                success: function (response) {
                     
                    if (response.success) {
                        if (response.data.length > 0) {
                        $.each(response.data, function (index, value) {

                            var feed =
                                {
                                    strIdPlane: value.IdPlano,
                                    strDescription: "NODO",
                                    strDistrict: value.NomDst,
                                    strCenterPopulated: value.DistDesc
                                };

                            if (Session.SessionParams.DATACUSTOMER.Tecnologia == "9") {
                                if (value.IdPlano.toUpperCase().indexOf('-F') > -1)
                                    dataPlane.push(feed);
                            }
                            else {
                                if (value.IdPlano.toUpperCase().indexOf('-F') < 0)
                                    dataPlane.push(feed);
                            }

                        });
                            that.loadPlano(dataPlane, '');
                    }
                        else
                        {
                            alert("No se encontraron planos.");
                            that.loadPlano(dataPlane, 'No se encontraron datos.');
                        }
                    }
                    else {
                        alert("Error al consultar los planos. Por favor intente nuevamente.");
                        that.loadPlano(dataPlane, 'No se encontraron datos.');
                    }
                   
                },
                error: function (ex) {
                    alert("Error al consultar los planos. Por favor intente nuevamente.");
                    that.loadPlano(dataPlane, 'No se encontraron datos.');
                }
                            

            });
          
            
        },
        loadPlano: function (dataPlane,texto) {
            var that = this;
            var controls = that.getControls();
            controls.tblPlane.DataTable({
                "scrollY": "200px",
                "scrollCollapse": true,
                "paging": true,
                "searching": true,
                "destroy": true,
                "scrollX": true,
                "sScrollXInner": "100%",
                "autoWidth": true,
                //"processing": true,
                "select": {
                    "style": "os",
                    "info": false
                },
                "language": {           
                    //"sProcessing": "Procesando...",
                    "lengthMenu": "Mostrar _MENU_ registros por página",
                    "zeroRecords": texto,
                    "info": " ",
                    "infoEmpty": "",
                    "infoFiltered": "(filtrado de  _MAX_ total registros)",
                    "sSearch": "Buscar: ",
                    "oPaginate": {
                        "sFirst": "Primero",
                        "sPrevious": "Anterior",
                        "sNext": "Siguiente",
                        "sLast": "Último"
                    }
                    },
                "data": dataPlane,
                "columns": [
                    { "orderable": false, "data": null, className: "select-radio", "defaultContent": "", render: function (data) { return "&nbsp"; } },
                    { "orderable": true, order: "asc", "data": "strIdPlane" },
                    { "data": "strDescription" },
                    { "data": "strDistrict" },
                    { "data": "strCenterPopulated" }
                ],
            });
            $.unblockUI();
        }
        //strUrlLogo: window.location.protocol + '//' + window.location.host + '/Content/images/SUFija/loading_Claro.gif',
    }

    $.fn.FormChoosePlane = function () {
        var option = arguments[0],
            args = arguments,
            value,
            allowedMethods = [];

        this.each(function () {
            var $this = $(this),
                data = $this.data('FormChoosePlane'),
                options = $.extend({}, $.fn.FormChoosePlane.defaults,
                    $this.data(), typeof option === 'object' && option);

            if (!data) {
                data = new Form($this, options);
                $this.data('FormChoosePlane', data);
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

    $.fn.FormChoosePlane.defaults = {
    }

    $('#ChoosePlane', $('.modal:last')).FormChoosePlane();

})(jQuery, null);