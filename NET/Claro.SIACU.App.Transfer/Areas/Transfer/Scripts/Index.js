(function ($, undefined) {
    'use strict';
    var Form = function ($element, options) {

        $.extend(this, $.fn.Transfer.defaults, $element.data(), typeof options === 'object' && options);

        this.setControls({
            form: $element,

            spnCustomerName: $('#spnCustomerName', $element),
            divCustomerInformation: $('#divCustomerDataView', $element),
            divCustomerDataView: $('#divCustomerDataView', $element),
            divTransferInternal: $('#divTransferInternal', $element),
            divTransferExternal: $('#divTransferExternal', $element),
            divMainBody: $('#navbar-body'),
            divMainHeader: $('#main-header'),
            divMainFooter: $('#main-footer'),
            /*Configurations*/
            stepsContainer: $('.process-row-step', $element),
            btnStep: $('.next-step'),
            divFooterInfoSot: $('.footer-info-sot'),
            btnSave: $('.Save-step'),
            btnPrevStep: $(".prev-step"),
            btnConstancy: $('.Constancy-step'),
            btnSaveInternal: $(".save-internal")
        });
    }

    Form.prototype = {
        constructor: Form,

        init: function () {

            var that = this,
                controls = this.getControls();
            controls.divTransferInternal.addEvent(that, 'click', that.divTransferInternal_Click);
            controls.divTransferExternal.addEvent(that, 'click', that.divTransferExternal_Click);
            controls.btnStep.addEvent(that, 'click', that.navigateTabs);
            controls.btnSave.addEvent(that, 'click', that.Save_click);
            controls.btnConstancy.addEvent(that, 'click', that.Constancy_click);
            controls.btnSaveInternal.addEvent(that, 'click', that.Save_click);
            that.render();
        },

        render: function () {
            var that = this,
                controls = this.getControls();

            moment.locale('es');
            that.timer();
            $("#divInternalTransfer").append($('<div>').load("/Transfer/Home/SchedulingInternal"));
            that.divTransferInternal_Click();
            that.TransferInit();
        },

        getControls: function () {
            return this.m_controls || {};
        },

        setControls: function (value) {
            this.m_controls = value;
        },

        resizeContent: function () {

            var controls = this.getControls();
            controls.divMainBody.css('height', $(window).outerHeight() - controls.divMainHeader.outerHeight() - controls.divMainFooter.outerHeight());
        },

        updateControl: function (object) {

            for (var prop in object) {
                if (typeof this.m_controls[prop] == 'undefined') {
                    this.m_controls[prop] = object[prop];
                }
            }
        },

        timer: function () {
            var that = this,
                controls = that.getControls();
            that.resizeContent();
            var time = moment().format('DD/MM/YYYY hh:mm:ss a');
            $('#idSession').html(string.format('Session ID: {0} &nbsp&nbsp {1}', Session.UrlParams.IdSession, time));
            var t = setTimeout(function () { that.timer() }, 500);
        },

        /* Metodos Carga Información */

        TransferSession: {},

        KeyTab: false,

        TransferInit: function () {

            var that = this,
                controls = that.getControls();
            //Session.SessionParams.DATACUSTOMER.ContractID = '29983351';//'29983351' //para generar sot
            //Session.SessionParams.DATACUSTOMER.CustomerID = '44853381';

            //Session.SessionParams.DATACUSTOMER.ContractID ="13326803";
            //Session.SessionParams.DATACUSTOMER.CustomerID = "36248101";
            //Session.SessionParams.DATACUSTOMER.ContractID = "43098550"; //CBIO
            //Session.SessionParams.DATACUSTOMER.CustomerID = "43421939"; //CBIO
            debugger;

            var plataformaAT = !$.string.isEmptyOrNull(Session.SessionParams.DATACUSTOMER.objPostDataAccount.plataformaAT) ? Session.SessionParams.DATACUSTOMER.objPostDataAccount.plataformaAT : '';
            var idTransactionFront = $.app.getTypeClientAsIsOrToBe(plataformaAT, '3', '11');
            var customerInformationPromise = $.reusableViews.viewOfTheLeftSide(controls.divCustomerInformation);
            var initialConfigurationPromise = $.app.transactionInitialConfigurationPromise(Session.SessionParams, idTransactionFront);
            Promise.all([customerInformationPromise, initialConfigurationPromise])
                .then(function (res) {
                    debugger
                    var initialConfiguration = res[1].oInitialDataResponse.MessageResponse.Body;
                    if (res[1].oDatosAdi.MessageResponse == null && initialConfiguration.CustomerInformation.CustomerList[0].ServiceStatus != 'Activo')
                            {
                            alert("La linea no se encuentra activa", 'Alerta', function () {
                                $.unblockUI();
                                parent.window.close();
                            });
        
                            return false;
                        }

                    var AdditionalFixedData = res[1].oDatosAdi.MessageResponse.Body,
                        AuditRequest = res[1].oAuditRequest,
                        Configuraciones = res[1].oConfiguraciones,
                        CoreServices = initialConfiguration.CoreServices || {},
                        AdditionalServices = initialConfiguration.AdditionalServices || {},
                        Igv = initialConfiguration.Igv,
                        CustomerInformation = initialConfiguration.CustomerInformation || {},
                        PuntoAtencion = initialConfiguration.PuntoAtencion || {},
                        DatosUsuarioCtaRed = initialConfiguration.obtenerDatosUsuarioCuentaRed || {},
                        OficinaVentaUsuario = initialConfiguration.obtenerOficinaVentaUsuario || {},
                        Configuration = AdditionalFixedData.servicios.configuracionesfija_obtenerConfiguraciones || {},
                        Instalacion = AdditionalFixedData.servicios.datosinstalacioncliente_obtenerDatosInstalacion || {},
                        Tipificacion = AdditionalFixedData.servicios.tipificacionreglas_obtenerInformacionTipificacion || {},
                        Ubigeos = AdditionalFixedData.servicios.ubicaciones_obtenerUbicaciones || {},
                        ValidarTransaccion = AdditionalFixedData.servicios.consultatransaccionfija_validarTransaccion || {},
                        AuditRequest = AuditRequest || {};

                    debugger;
                    that.TransferSession.Data = {};
                    that.TransferSession.Data.idTransactionFront = idTransactionFront;
					that.TransferSession.Data.plataformaAT = plataformaAT;
                    that.TransferSession.Data.CustomerInformation = (CustomerInformation.CodeResponse == '0') ? CustomerInformation.CustomerList[0] : [];
                    that.TransferSession.Data.CoreServices = (CoreServices.CodeResponse == '0') ? CoreServices.ServiceList : [];
                    that.TransferSession.Data.AdditionalServices = (AdditionalServices.CodeResponse == '0') ? AdditionalServices.AdditionalServiceList : [];
                    that.TransferSession.Data.AdditionalEquipment = (AdditionalServices.CodeResponse == '0') ? AdditionalServices.AdditionalEquipmentList : [];
                    that.TransferSession.Data.ListIgv = (Igv.CodeResponse == '0') ? Igv.listaIGV : [];
                    that.TransferSession.Data.Configuration = (Configuration.CodeResponse == '0') ? Configuration.ProductTransaction.ConfigurationAttributes : [];
                    that.TransferSession.Data.Technology = (CoreServices.Technology != '' || CoreServices.Technology != null) ? CoreServices.Technology : [];
                    that.TransferSession.Data.Instalation = (Instalacion.CodeResponse == '0') ? Instalacion : [];
                    that.TransferSession.Data.Ubigeos = (Ubigeos.CodigoRespuesta == '0') ? Ubigeos.listaUbicaciones : [];
                    that.TransferSession.Data.PuntoAtencion = (PuntoAtencion.CodigoRespuesta == '0') ? PuntoAtencion.listaRegistros : [];
                    that.TransferSession.Data.DatosUsuarioCtaRed = (DatosUsuarioCtaRed.CodigoRespuesta == '0') ? DatosUsuarioCtaRed.listaDatosUsuarioCtaRed : [];
                    that.TransferSession.Data.OficinaVentaUsuario = (OficinaVentaUsuario.CodigoRespuesta == '0') ? OficinaVentaUsuario.listaOficinaVenta : [];
                    that.TransferSession.Data.ValidaEta = [];
                    that.TransferSession.Data.AuditRequest = AuditRequest;
                    that.TransferSession.Data.Tipificacion_TI = (Tipificacion.CodigoRespuesta == '0') ? Tipificacion.listaTipificacionRegla[0] : [];
                    that.TransferSession.Data.Tipificacion_TE = (Tipificacion.CodigoRespuesta == '0') ? Tipificacion.listaTipificacionRegla[1] : [];
                    

                    that.TransferSession.Data.ValidarTransaccion = (ValidarTransaccion != null ? (ValidarTransaccion.ResponseAudit != null ? ValidarTransaccion.ResponseData : []) : []);

                    Session.SessionParams.DATACUSTOMER.Tecnologia = that.TransferSession.Data.Technology;
                    that.TransferSession.Data.planCode = (CoreServices.planCode != '' || CoreServices.planCode != null) ? CoreServices.planCode : [];


                    // Set Configuration 
                    that.TransferSession.Configuration = {};
                    that.TransferSession.Configuration.Constants = {};
                    that.TransferSession.Configuration.Constants = Configuraciones;
                    that.TransferSession.Configuration.Constants.Producto = (that.TransferSession.Data.Configuration.length > 0) ? Configuration.ProductTransaction.Producto : "";
                    /***INI-Nuevas configuraciones***/
                    that.TransferSession.Configuration.Constants.Plataforma_Facturador = that.TransferSession.Data.idTransactionFront == '3' ? 'BSCS7' : 'CBIO';
                    // that.TransferSession.Configuration.Constants.Trama_TipoServicio = that.TransferSession.Data.idTransactionFront == '3' ? '0061' : '0101';

                    if (that.TransferSession.Data.Technology == "9" || that.TransferSession.Data.Technology == "09") {
                        debugger;
                        that.TransferSession.Configuration.Constants.Constantes_TE_Tipotrabajo = that.TransferSession.Data.idTransactionFront == '3' ? that.TransferSession.Configuration.Constants.Constantes_TE_Tipotrabajo : '1089'; //FTTH 1089 HFC 1052
                        that.TransferSession.Configuration.Constants.Constantes_TI_Tipotrabajo = that.TransferSession.Data.idTransactionFront == '3' ? that.TransferSession.Configuration.Constants.Constantes_TI_Tipotrabajo : '1090'; //FTTH 1090 HFC 1053
                        that.TransferSession.Configuration.Constants.Constantes_TE_MotivoSot = that.TransferSession.Data.idTransactionFront == '3' ? that.TransferSession.Configuration.Constants.Constantes_TE_MotivoSot : '1103'; //FTTH 1052 HFC 1096
                        that.TransferSession.Configuration.Constants.Constantes_TI_MotivoSot = that.TransferSession.Data.idTransactionFront == '3' ? that.TransferSession.Configuration.Constants.Constantes_TI_MotivoSot : '1103'; //FTTH 1052 HFC 1096
                        that.TransferSession.Configuration.Constants.Trama_TipoServicio = that.TransferSession.Data.idTransactionFront == '3' ? '0061' : '0101';/*AS IS - TO BE*/
                        that.TransferSession.Configuration.Constants.Constantes_Tipservicio = that.TransferSession.Data.idTransactionFront == '3' ? '0061' : '0101';/*AS IS - TO BE*/
                    } else {


                        that.TransferSession.Configuration.Constants.Constantes_TE_Tipotrabajo = that.TransferSession.Data.idTransactionFront == '3' ? that.TransferSession.Configuration.Constants.Constantes_TE_Tipotrabajo : '1052'; //FTTH 1089 HFC 1052
                        that.TransferSession.Configuration.Constants.Constantes_TI_Tipotrabajo = that.TransferSession.Data.idTransactionFront == '3' ? that.TransferSession.Configuration.Constants.Constantes_TI_Tipotrabajo : '1053'; //FTTH 1090 HFC 1053
                        that.TransferSession.Configuration.Constants.Constantes_TE_MotivoSot = that.TransferSession.Data.idTransactionFront == '3' ? that.TransferSession.Configuration.Constants.Constantes_TE_MotivoSot : '1096'; //FTTH 1052 HFC 1096
                        that.TransferSession.Configuration.Constants.Constantes_TI_MotivoSot = that.TransferSession.Data.idTransactionFront == '3' ? that.TransferSession.Configuration.Constants.Constantes_TI_MotivoSot : '1096'; //FTTH 1052 HFC 1096
                        that.TransferSession.Configuration.Constants.Trama_TipoServicio = that.TransferSession.Data.idTransactionFront == '3' ? '0061' : '0061';/*AS IS - TO BE*/
                        that.TransferSession.Configuration.Constants.Constantes_Tipservicio = that.TransferSession.Data.idTransactionFront == '3' ? '0061' : '0061';/*AS IS - TO BE*/
                    }



                    /***FIN-Nuevas configuraciones***/

                    $.reusableBusiness.getIgv(that.TransferSession.Data.ListIgv, function (igv) {

                        that.TransferSession.Data.Configuration.Constantes_Igv = igv;
                        // Load Customer Information - Left Panel
                        $.app.renderCustomerInformation(that.TransferSession);
                        // Load Core Service Information - Left Panel
                        // if (!$.array.isEmptyOrNull(that.TransferSession.Data.CoreServices))
                        $.app.renderCoreServices(that.TransferSession);
                        // Load Additional Service Information - Left Panel
                        // if (!$.array.isEmptyOrNull(that.TransferSession.Data.AdditionalServices))
                        $.app.renderAdditionalServices(that.TransferSession);
                        // Load Additional Equipment Information - Left Panel
                        // if (!$.array.isEmptyOrNull(that.TransferSession.Data.AdditionalEquipment))
                        $.app.renderAdditionalEquipment(that.TransferSession);

                    });
                    if (!that.InitialValidation()) {
                        return false;
                    }

                    var attributes = that.TransferSession.Data.Configuration;

                    that.TransferSession.Configuration.Steps = attributes.filter(function (e) { return (e.AttributeName == 'step') });
                    that.TransferSession.Configuration.Views = attributes.filter(function (e) { return (e.AttributeType == 'CONTENEDOR') });

                    // Current Selected Information
                    var
                        viewsPromise = that.viewsRenderPromise(),
                        stepsPromise = that.stepsRenderPromise(controls.stepsContainer);

                    Promise.all([viewsPromise, stepsPromise]) // Carga de las Vistas de la Transacción
                        .then(function (renderResponse) {
                            // Reasign HTML Controls
                            controls = that.AsignControls(that, controls.form);



                            controls.btnPlane.addEvent(that, 'click', that.btnAddPlane_Click);
                            controls.btnValBuilding.addEvent(that, 'click', that.btnAddBuilding_Click);
                            controls.chkSN.addEvent(that, 'change', that.chkSn_Click);
                            controls.ddlNoteCenterPopulated.addEvent(that, 'change', that.ddlNoteCenterPopulated_Click);
                            controls.chkSN.change(function () { that.AddDestinationAddress_Click('') });
                            controls.ddlStreet.change(function () { that.AddDestinationAddress_Click('ddlStreet'); });
                            controls.txtNameStreet.keyup(function () { that.AddDestinationAddress_Click('txtNameStreet'); });
                            controls.txtNumber.keyup(function () { that.AddDestinationAddress_Click('txtNumber'); });
                            controls.ddlTipMzBloEdi.change(function () { that.AddDestinationAddress_Click(''); });
                            controls.txtNumberBlock.keyup(function () { that.AddDestinationAddress_Click(''); });
                            controls.txtLot.keyup(function () { that.AddDestinationAddress_Click(''); });
                            controls.ddlDepartInter.change(function () { that.AddDestinationAddress_Click(''); });
                            controls.txtNumberDepartInter.keyup(function () { that.AddDestinationAddress_Click(''); });
                            controls.ddlNoteUrbanization.change(function () { that.AddNoteDestinationAddress_Click('ddlNoteUrbanization'); });
                            controls.txtNoteUrbanization.keyup(function () { that.AddNoteDestinationAddress_Click('txtNoteUrbanization'); });
                            controls.ddlNoteZote.change(function () { that.AddNoteDestinationAddress_Click(''); });
                            controls.txtNoteNameZote.keyup(function () { that.AddNoteDestinationAddress_Click(''); });
                            controls.txtNoteReference.keyup(function () { that.AddNoteDestinationAddress_Click(''); });
                            controls.txtNumberDepartInter.keydown(function (event) { that.ValidateNumbers_Click(event); });
                            controls.txtNumber.keydown(function (event) { that.ValidateNumbers_Click(event); });
                            controls.btnValidateCoverage.addEvent(that, 'click', that.btnValidateCoverage_click);
                            controls.chkLoyalty.change(function () { that.chkLoyalty_Click(); });
                            controls.chkSendMail.addEvent(that, 'change', that.chkSendMail_Click);
                            controls.chkSendMail_Internal.addEvent(that, 'change', that.chkSendMail_Click);
                            //controls.txtReferencePhone.keydown(function (event) { that.ValidateNumbers_Click(event); });
                            controls.ddlNoteDepartment.change(function () { that.ddlNoteDepartment_Click() });
                            controls.ddlNoteProvince.change(function () { that.ddlNoteProvince_Click() });
                            controls.ddlNoteDistrict.change(function () { that.ddlNoteDistrict_Click() });
                            controls.ddlWorkType.change(function () { that.ddlWorkType_Click() });
                            controls.txtCalendar.change(function () { that.txtCalendar_Change() });
                            controls.ddlTimeZone.change(function () { that.ddlTimeZone_Click() });
                            controls.txtSendMail.val(that.TransferSession.Data.CustomerInformation.Email);
                            controls.navigateIcon.addEvent(that, 'click', that.navigateIcons);
                            controls.ddlSubWorkType.change(function () { that.validateControl('ddlSubWorkType') });
                            controls.ddlSubWorkType_Internal.change(function () { that.validateControl('ddlSubWorkType_Internal') });
                            $('#ddlCenterofAttention_Internal').change(function () { that.validateControl('ddlCenterofAttention_Internal') });
                            $('#ddlCenterofAttention').change(function () { that.validateControl('ddlCenterofAttention') });
                            // that.loadCargaInicial("3", "1", Session.SessionParams.DATACUSTOMER.ContractID, "TODOS");


                            that.loadCargaInicial(that.TransferSession.Data.idTransactionFront, "1", Session.SessionParams.DATACUSTOMER.ContractID, "TODOS");
                            that.TransferSession.Configuration.Constants.nroOrdenTOA = "0";
                        })
                        .catch(function (e) {
                            $.unblockUI();
                            alert(string.format('Ocurrio un error al cargar la transacción - {0}', e));
                            $('#navbar-body').showMessageErrorLoadingTransaction();
                        })
                        .then(function (renderResponse) {

                            that.getWorkType(that.TransferSession.Data.Instalation.CodPlano, that.TransferSession.Data.Instalation.Ubigeo);

                            var montoOcc = (that.KeyTab) ? that.TransferSession.Configuration.Constants.Constantes_TE_MontoOcc : that.TransferSession.Configuration.Constants.Constantes_TI_MontoOcc
                            montoOcc = montoOcc.replace(",", ".");
                            var igv = "1." + that.TransferSession.Data.Configuration.Constantes_Igv;
                            //var montoOccMasIgv = parseFloat(montoOcc) * parseFloat(igv);
                            var montoOccMasIgv = that.TransferSession.Data.idTransactionFront == '3' ? (parseFloat(montoOcc) * parseFloat(igv)) : parseFloat(montoOcc);
                            controls.txtChargeAmount.val(montoOccMasIgv.toFixed(2))
                        });
                })
                .catch(function (e) {
                    $.unblockUI();
                    alert(string.format('Ocurrio un error al obtener la Configuración - {0}', e));
                    $('#navbar-body').showMessageErrorLoadingTransaction();
                })
                .then(function () {
                    $.unblockUI();
                });

        },

        AsignControls: function (that, $element) {

            that.updateControl({

                /*Address*/
                ddlStreet: $('#ddlStreet', $element),
                txtNameStreet: $('#txtNameStreet', $element),
                txtNumber: $('#txtNumber', $element),
                chkSN: $('#chkSN', $element),
                ddlTipMzBloEdi: $('#ddlTipMzBloEdi', $element),
                txtLot: $('#txtLot', $element),
                txtNumberBlock: $('#txtNumberBlock', $element),
                ddlDepartInter: $('#ddlDepartInter', $element),
                txtNumberDepartInter: $('#txtNumberDepartInter', $element),
                ddlNoteUrbanization: $('#ddlNoteUrbanization', $element),
                txtNoteUrbanization: $('#txtNoteUrbanization', $element),
                ddlNoteZote: $('#ddlNoteZote', $element),
                txtNoteNameZote: $('#txtNoteNameZote', $element),
                txtNoteReference: $('#txtNoteReference', $element),
                //ddlNoteCountry: $('#ddlNoteCountry', $element),
                ddlNoteDepartment: $('#ddlNoteDepartment', $element),
                ddlNoteProvince: $('#ddlNoteProvince', $element),
                ddlNoteDistrict: $('#ddlNoteDistrict', $element),
                txtConDir: $('#txtConDir', $element),
                txtConNotDir: $('#txtConNotDir', $element),
                txtCodPlane: $('#txtCodPlane', $element),
                txtCodBuilding: $('#txtCodBuilding', $element),
                btnPlane: $('#btnPlane', $element),
                btnValBuilding: $('#btnValBuilding', $element),
                lnkCob: $('#lnkCob', $element),
                //idtruelnkcob: $('#idtruelnkcob', $element),
                //idfalselnkcob: $('#idfalselnkcob', $element),
                idtruelnkValBuilding: $('#idtruelnkValBuilding', $element),
                idfalselnkValBuilding: $('#idfalselnkValBuilding', $element),
                ddlNoteCenterPopulated: $('#ddlNoteCenterPopulated', $element),
                txtNoteCodePostal: $('#txtNoteCodePostal', $element),
                spnPreAddressNew: $('#spnPreAddressNew', $element),
                spnPreReference: $('#spnPreReference', $element),
                btnValidateCoverage: $('#btnValidateCoverage'),
                /*Scheduling - Agendamiento */
                ddlWorkType: $('.WorkType', $element),
                ddlSubWorkType: $('.SubWorkType', $element),
                ddlReasonSot: $('.ReasonSot', $element),
                chkLoyalty: $('.chkLoyalty', $element),
                txtChargeAmount: $('.txtChargeAmount', $element),
                // btnSaveInternal: $('#btn-save-internal', $element),
                //txtCalendar: $('#txtCalendar', $element),
                txtCalendar: $('.txtCalendar', $element),
                ddlTimeZone: $('.ddlTimeZone', $element),
                chkSendMail: $('#chkSendMail', $element),
                chkSendMail_Internal: $('#chkSendMail_Internal', $element),
                txtSendMail: $('.txtSendMail', $element),
                txtReferencePhone: $('.txtReferencePhone', $element),
                ddlCenterofAttention: $('.ddlCenterofAttention', $element),
                txtNote: $('.txtNote', $element),
                //btnSaveInternal: $('.Save-step', $element),

                ddlSubWorkType_Internal: $('#ddlSubWorkType_Internal', $element),
                //Mensajes de Errror
                ErrorMessageddlWorkTypeInternal: $('#ErrorMessageddlWorkType_Internal', $element),
                ErrorMessageddlSubWorkTypeInternal: $('#ErrorMessageddlSubWorkType_Internal', $element),
                ErrorMessageddlReasonSotInternal: $('#ErrorMessageddlReasonSot_Internal', $element),
                ErrorMessagetxtCalendarInternal: $('#ErrorMessagetxtCalendar_Internal', $element),
                ErrorMessageddlTimeZoneInternal: $('#ErrorMessageddlTimeZone_Internal', $element),
                ErrorMessageddlCenterofAttentionInternal: $('#ErrorMessageddlCenterofAttention_Internal', $element),

                ErrorMessagetxtSendMail: $('.ErrorMessagetxtSendMail', $element),
                ErrorMessageddlStreet: $('#ErrorMessageddlStreet', $element),
                ErrorMessagetxtNameStreet: $('#ErrorMessagetxtNameStreet', $element),
                ErrorMessagetxtNumber: $('#ErrorMessagetxtNumber', $element),
                ErrorMessageddlNoteUrbanization: $('#ErrorMessageddlNoteUrbanization', $element),
                ErrorMessagetxtNoteUrbanization: $('#ErrorMessagetxtNoteUrbanization', $element),
                ErrorMessageddlNoteDepartment: $('#ErrorMessageddlNoteDepartment', $element),
                ErrorMessageddlNoteProvince: $('#ErrorMessageddlNoteProvince', $element),
                ErrorMessageddlNoteDistrict: $('#ErrorMessageddlNoteDistrict', $element),
                ErrorMessageddlNoteCenterPopulated: $('#ErrorMessageddlNoteCenterPopulated', $element),
                ErrorMessagetxtCodPlane: $('#ErrorMessagetxtCodPlane', $element),

                ErrorMessageddlWorkType: $('.ErrorMessageddlWorkType', $element),
                ErrorMessageddlSubWorkType: $('#ErrorMessageddlSubWorkType', $element),
                ErrorMessageddlReasonSot: $('#ErrorMessageddlReasonSot', $element),
                ErrorMessagetxtCalendar: $('#ErrorMessagetxtCalendar', $element),
                ErrorMessageddlTimeZone: $('#ErrorMessageddlTimeZone', $element),
                ErrorMessageddlCenterofAttention: $('#ErrorMessageddlCenterofAttention', $element),
                /**/
                navigateIcon: $('.btn-circle-step', $element),
            });

            return that.getControls();
        },
        /*
                customerInformationPromise: function (container) {
        
                    return new Promise(function (resolve, reject) {
        
                        $.ajax({
                            type: 'POST',
                            url: '/Transfer/Home/CustomerData',
                            success: function (res) {
                                container.html(res);
                                resolve(true);
                            },
                            error: function (err) { reject(err) }
                        });
        
                    });
                },*/

        stepsRenderPromise: function (container) {
            var that = this,
                controls = that.getControls();

            return new Promise(function (resolve, reject) {
                $.app.createSteps(that.TransferSession.Configuration.Steps, container);
                resolve();
            });
        },

        viewsRenderPromise: function () {
            var that = this,
                controls = that.getControls();

            return new Promise(function (resolve, reject) {
                var transactionViews = that.TransferSession.Configuration.Views;
                $.app.ViewsRender(transactionViews, transactionViews, '', 'transactionContent', resolve);
            });
        },

        /*
                InitialValidation: function () {
                    var that = this,
                        controls = that.getControls(),
                        state = that.TransferSession.Data.CustomerInformation.ContractStatus;
        
                    //Checking the status of the contract
                    if (state != null || state != undefined) {
                        if (state.trim().toUpperCase() != 'ACTIVO') {
                            alert("La linea no se encuentra activa", 'Alerta', function () {
                                $.unblockUI();
                                parent.window.close();
                            });
        
                            return false;
                        }
                    }
                    else {
                        return false;
                    }
        
                    return true;
                },*/
        InitialValidation: function () {
            var that = this,
                controls = that.getControls(),
                stateContract = !$.string.isEmptyOrNull(that.TransferSession.Data.CustomerInformation.ContractStatus) ? that.TransferSession.Data.CustomerInformation.ContractStatus : '',
                stateService = !$.string.isEmptyOrNull(that.TransferSession.Data.CustomerInformation.ServiceStatus) ? that.TransferSession.Data.CustomerInformation.ServiceStatus : '';
            debugger;
            console.log('stateContract: ' + stateContract);
            console.log('stateService:  ' + stateService);
            console.log('Plataforma:  ' + Session.SessionParams.DATACUSTOMER.objPostDataAccount.plataformaAT);
            //Checking the status of the contract
            // if (stateContract != null || stateContract != undefined || stateService != null || stateService != undefined) {
            if (Session.SessionParams.DATACUSTOMER.objPostDataAccount.plataformaAT === 'TOBE') {
                if (stateContract.trim().toUpperCase() != 'ACTIVO' || stateService.trim().toUpperCase() != 'ACTIVO') {
                    alert("El contrato no se encuentra activo.", 'Alerta', function () {
                        $.unblockUI();
                        parent.window.close();
                    });
                    return false;
                }
            }
            else {
                if (stateContract.trim().toUpperCase() != 'ACTIVO') {
                    alert("El contrato no se encuentra activo.", 'Alerta', function () {
                        $.unblockUI();
                        parent.window.close();
                    });
                    return false;
                }
            }


            if (!$.array.isEmptyOrNull(that.TransferSession.Data.ValidarTransaccion)) {
                if (that.TransferSession.Data.ValidarTransaccion.Codigo == "-3") {
                    alert(that.TransferSession.Data.ValidarTransaccion.Mensaje, 'Alerta', function () {
                        $.unblockUI();
                        parent.window.close();
                    });
                    return false;
                }

                if (that.TransferSession.Data.ValidarTransaccion.Codigo == "-1") {
                    alert("Error al validar transacción", 'Alerta', function () {
                        $.unblockUI();
                        parent.window.close();
                    });
                    return false;
                }

            }


            // }
            // else {
            //     return false;
            // }

            return true;
        },

        /* PartialView Address -Notas Dirección */
        getWorkType: function (plano, ubigeo) {
            var that = this;
            var controls = this.getControls();
            that.getLoadingPage();

            that.GetTipoTrabajo(plano, ubigeo);
        },

        ddlWorkType_Click: function () {
        },

        getFechaActual: function () {
            var that = this;
            var d = new Date();
            var FechaActual = that.AboveZero(d.getDate()) + "/" + (that.AboveZero(d.getMonth() + 1)) + "/" + d.getFullYear();
            return FechaActual;
        },

        getHoraActual: function () {
            var that = this;
            var d = new Date();
            var HoraActual = that.AboveZero(d.getHours()) + ":" + (that.AboveZero(d.getMinutes() + 1)) + ":" + d.getSeconds();
            return HoraActual;
        },

        AboveZero: function (i) {

            if (i < 10) {
                i = '0' + i;
            }
            return i;
        },

        GenerarDireccion: function () {
            var controls = this.getControls();
            var Direccion = "";

            if ($("#ddlStreet option:selected").html() != 'zz')
                Direccion = String.format("{0} {1}", controls.ddlStreet.val().substring(0, 2), controls.txtNameStreet.val() != '' ? controls.txtNameStreet.val() : '')
            else
                Direccion = String.format("{0} {1}", "CA", controls.ddlStreet.val().substring(0, 2), controls.txtNameStreet.val() != '' ? controls.txtNameStreet.val() : '')

            if (controls.txtNumber.val() != '')
                Direccion = Direccion + String.format(" {0}", controls.txtNumber.val().trim());

            if (controls.txtNumber.val() != '' && controls.txtNumberBlock.val() != '' && controls.txtLot.val() != '')
                Direccion = Direccion + String.format(" {0}", "S/N");

            if (controls.ddlTipMzBloEdi.val() != '')
                Direccion = Direccion + String.format(" {0} {1}", controls.ddlTipMzBloEdi.val(), controls.txtNumberBlock.val() != '' ? controls.txtNumberBlock.val().toUpperCase() : '');

            if (controls.txtLot.val() != '')
                Direccion = Direccion + String.format(" {0} {1}", "LT", controls.txtLot.val());

            if (controls.ddlDepartInter.val() != '')
                Direccion = Direccion + String.format(" {0} {1}", $("#ddlDepartInter option:selected").html(), controls.txtNumberDepartInter.val() != '' ? controls.txtNumberDepartInter.val() : '');
            return Direccion;
        },

        GenerarDireccionSinCode: function () {
            var controls = this.getControls();
            var Direccion = "";

            if ($("#ddlStreet option:selected").html() != 'zz')
                Direccion = String.format("{0} {1}", $("#ddlStreet option:selected").text(), controls.txtNameStreet.val() != '' ? controls.txtNameStreet.val() : '')
            else
                Direccion = String.format("{0} {1}", "CA", $("#ddlStreet option:selected").text(), controls.txtNameStreet.val() != '' ? controls.txtNameStreet.val() : '')

            if (controls.txtNumber.val() != '')
                Direccion = Direccion + String.format(" {0}", controls.txtNumber.val().trim());

            if (controls.ddlTipMzBloEdi.val() != '')
                Direccion = Direccion + String.format(", {0} {1}", $("#ddlTipMzBloEdi option:selected").text(), controls.txtNumberBlock.val() != '' ? controls.txtNumberBlock.val().toUpperCase() : '');

            if (controls.txtLot.val() != '')
                Direccion = Direccion + String.format(" {0} {1}", "LT", controls.txtLot.val());

            if (controls.ddlDepartInter.val() != '')
                Direccion = Direccion + String.format(", {0} {1}", $("#ddlDepartInter option:selected").text(), controls.txtNumberDepartInter.val() != '' ? controls.txtNumberDepartInter.val() : '');

            return Direccion;
        },

        GenerarNotasDireccion: function () {
            var controls = this.getControls();
            var NotasDireccion = "";

            if (controls.ddlNoteUrbanization.val() != '')
                NotasDireccion = NotasDireccion + String.format("{0} {1}", $("#ddlNoteUrbanization option:selected").html() != '' ? $("#ddlNoteUrbanization option:selected").html().substring(0, 2) : '', controls.txtNoteUrbanization.val() != null ? controls.txtNoteUrbanization.val() : '');

            NotasDireccion = String.format("{0} {1}", NotasDireccion, controls.txtNoteReference.val() != '' ? controls.txtNoteReference.val() : '');

            return NotasDireccion;
        },

        txtCalendar_Change: function () {
            var that = this;
            var controls = this.getControls();
            var fechaSeleccionada = (that.KeyTab) ? $('#txtCalendar').val() : $('#txtCalendar_Internal').val();
            var plano = controls.txtCodPlane.val(), ubigeo = that.getUbigeoSeleccionado();


            if ((that.KeyTab) ? $('#ddlSubWorkType').val() == '' && that.TransferSession.Data.ValidaEta.FlagIndica != '0' : $('#ddlSubWorkType_Internal').val() == '' && that.TransferSession.Data.ValidaEta.FlagIndica != '0') {
                controls.ddlSubWorkType.closest('.form-control').addClass('has-error');
                controls.ErrorMessageddlSubWorkType.text('Seleccione subtipo de trabajo.');
                controls.ddlSubWorkType.focus();
                return false;
            }
            else {
                controls.ErrorMessageddlSubWorkType.closest('.form-control').removeClass('has-error');
                controls.ErrorMessageddlSubWorkType.text('');
            }

            that.getLoadingPage();

            that.TransferSession.Data.Instalation.CodPlano = (that.TransferSession.Data.Instalation.CodPlano == undefined) ? "" : that.TransferSession.Data.Instalation.CodPlano;

            var ActivityCapacity = [
                { "nombre": "XA_Map", "valor": that.PadLeft((plano == '') ? that.TransferSession.Data.Instalation.CodPlano : plano, 10) }, //000LMSQ090 //"000L14001V"
                { "nombre": "XA_WorkOrderSubtype", "valor": (plano == '') ? $("#ddlSubWorkType_Internal").val() : $("#ddlSubWorkType").val() },//controls.ddlSubWorkType.val() },// HFCPTI01
                { "nombre": "XA_Zone", "valor": that.TransferSession.Data.ValidaEta.CodigoZona }//3133
            ]

            that.loadCargaFranjaHorario(
                 that.TransferSession.Data.ValidaEta.FlagIndica,//flagValidaEta
                 (plano == '') ? $("#ddlWorkType_Internal").val() : $("#ddlWorkType").val(),
                 fechaSeleccionada,
                 that.TransferSession.Configuration.Constants.Constantes_Origen,
                 (plano == '') ? that.TransferSession.Data.Instalation.CodPlano : plano, //"AQSB003","LMSQ090"
                 (plano == '') ? that.TransferSession.Data.Instalation.Ubigeo : ubigeo,//ubigeo
                 (plano == '') ? $("#ddlSubWorkType_Internal option:selected").attr("idtiposervicio") : $("#ddlSubWorkType option:selected").attr("idtiposervicio"),
                 (plano == '') ? $("#ddlSubWorkType_Internal option:selected").attr("CodTipoOrden") : $("#ddlSubWorkType option:selected").attr("CodTipoOrden"),
                 (plano == '') ? $("#ddlSubWorkType_Internal").val() : $("#ddlSubWorkType").val(),//controls.ddlSubWorkType.val(), //controls.ddlSubWorkType.val(),//subtipoOrden -$("#ddlSubWorkType 
                 that.TransferSession.Data.ValidaEta.CodigoZona,
                 Session.SessionParams.DATACUSTOMER.CustomerID,
                 Session.SessionParams.DATACUSTOMER.ContractID,
                 that.TransferSession.Configuration.Constants.Constantes_ReglaValidacion,
                 ActivityCapacity
             );

            var calendar = "";

            if (that.KeyTab) {
                calendar = $('#txtCalendar').val();

                if (calendar == '' || calendar == null) {
                    $('#txtCalendar').closest('.form-control').addClass('has-error');
                    $('#ErrorMessagetxtCalendar').text('Ingrese fecha de programación.');
                    $('#txtCalendar').focus();
                    return false;
                } else {
                    $('#ErrorMessageddlTimeZone').closest('.form-control').removeClass('has-error');
                    $('#ErrorMessageddlTimeZone').text('');
                    $('#ErrorMessagetxtCalendar').closest('.form-control').removeClass('has-error');
                    $('#ErrorMessagetxtCalendar').text('');
                }

            } else {
                calendar = $('#txtCalendar_Internal').val();

                if (calendar == '' || calendar == null) {
                    $('#txtCalendar_Internal').closest('.form-control').addClass('has-error');
                    $('#ErrorMessagetxtCalendar_Internal').text('Ingrese fecha de programación.');
                    $('#txtCalendar_Internal').focus();
                    return false;
                } else {
                    $('#ErrorMessageddlTimeZone_Internal').closest('.form-control').removeClass('has-error');
                    $('#ErrorMessageddlTimeZone_Internal').text('');
                    $('#ErrorMessagetxtCalendar_Internal').closest('.form-control').removeClass('has-error');
                    $('#ErrorMessagetxtCalendar_Internal').text('');
                }
            }
        },

        PadLeft: function (num, length) {
            while (num.length < length) {
                num = '0' + num;
            }
            return num;
        },

        chkLoyalty_Click: function () {
            var that = this;
            var controls = that.getControls();

            if (that.KeyTab) {
                if ($('#chkLoyalty').prop("checked")) {
                    $('#chkLoyalty').prop("checked", true);
                    $('#txtChargeAmount').val("0.00");
                } else {
                    $('#chkLoyalty').prop("checked", false);
                    var montoOcc = that.TransferSession.Configuration.Constants.Constantes_TE_MontoOcc
                    montoOcc = montoOcc.replace(",", ".");
                    var igv = "1." + that.TransferSession.Data.Configuration.Constantes_Igv;
                    // var montoOccMasIgv = parseFloat(montoOcc) * parseFloat(igv);
                    var montoOccMasIgv = that.TransferSession.Data.idTransactionFront == '3' ? (parseFloat(montoOcc) * parseFloat(igv)) : parseFloat(montoOcc);
                    $('#txtChargeAmount').val(montoOccMasIgv.toFixed(2));
                }

            } else {
                if ($('#chkLoyalty_Internal').prop("checked")) {
                    $('#chkLoyalty_Internal').prop("checked", true);
                    $('#txtChargeAmount_Internal').val("0.00");
                }
                else {
                    $('#chkLoyalty_Internal').prop("checked", false);
                    var montoOcc = that.TransferSession.Configuration.Constants.Constantes_TI_MontoOcc
                    montoOcc = montoOcc.replace(",", ".");
                    var igv = "1." + that.TransferSession.Data.Configuration.Constantes_Igv;
                    //var montoOccMasIgv = parseFloat(montoOcc) * parseFloat(igv);
                    var montoOccMasIgv = that.TransferSession.Data.idTransactionFront == '3' ? (parseFloat(montoOcc) * parseFloat(igv)) : parseFloat(montoOcc);
                    $('#txtChargeAmount_Internal').val(montoOccMasIgv.toFixed(2));
                }
            }

        },

        chkSendMail_Click: function (sender, arg) {
            var that = this;
            var controls = that.getControls(),
                flagChkMail = (that.KeyTab) ? controls.chkSendMail.prop("checked") : controls.chkSendMail_Internal.prop("checked");

            if (flagChkMail) {

                controls.chkSendMail.prop("checked", true);
                controls.chkSendMail_Internal.prop("checked", true);
                controls.txtSendMail.attr('disabled', false);
                controls.txtSendMail.val(that.TransferSession.Data.CustomerInformation.Email);

            }
            else {
                controls.chkSendMail.prop("checked", false);
                controls.txtSendMail.attr('disabled', true);
            }
        },

        /* PartialView Scheduling - Agendamiento */
        getNoteDepartment: function () {
            var that = this;
            var controls = this.getControls();

            that.GetDepartaments();
        },

        getNoteProvince: function () {
            var that = this;
            var controls = this.getControls();
            controls.ddlNoteProvince.append($('<option>', { value: '', html: '-Seleccionar-' }));
        },

        getNoteDistrict: function () {
            var that = this;
            var controls = this.getControls();
            controls.ddlNoteDistrict.append($('<option>', { value: '', html: '-Seleccionar-' }));

        },

        getNoteCenterPopulated: function () {
            var that = this;
            var controls = this.getControls();
            controls.ddlNoteCenterPopulated.append($('<option>', { value: '', html: '-Seleccionar-' }));
        },

        getNoteUrbanization: function () {
            var that = this;
            var controls = this.getControls();
            that.fnCargaAvenidasUrbanizacion(2, controls.ddlNoteUrbanization);
        },

        getNoteZote: function () {
            var that = this;
            var controls = this.getControls();
            that.fnCargaZonaManzanaInterior('TU_TIPO_ZONA', controls.ddlNoteZote);
        },

        getStreet: function () {
            var that = this;
            var controls = this.getControls();
            that.fnCargaAvenidasUrbanizacion(1, controls.ddlStreet);
        },

        fnCargaAvenidasUrbanizacion: function (tipo, objeto) {
            var objLoadParameters = {};
            var that = this;

            var urlBase = tipo == 1 ? '/Transfer/Home/GetTiposVias' : '/Transfer/Home/GetTiposUrbanizacion';
            $.app.ajax({
                type: 'POST',
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                url: urlBase,
                success: function (response) {
                    that.createDropdownFill(response.data, objeto, true);
                }
            });
        },

        fnCargaZonaManzanaInterior: function (tipointerior, objeto) {
            var objLoadParameters = {};
            var that = this;
            objLoadParameters.tipoInterior = tipointerior;

            var urlBase = '/Transfer/Home/GetBloquesTiposZonas';
            $.app.ajax({
                type: 'POST',
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(objLoadParameters),
                url: urlBase,
                success: function (response) {
                    that.createDropdownFill(response.data, objeto, true);
                }
            });
        },

        createDropdownFill: function (response, objeto, opcion) {

            objeto.empty();
            if (opcion) {
                objeto.append($('<option>', { value: '', html: 'Seleccionar' }));
            }
            if (response != null) {
                $.each(response, function (index, value) {
                    objeto.append($('<option>', { value: value.Code, html: value.Description }));
                });
            }

            $.unblockUI();
        },

        getTipMzBloEdi: function (tipointerior) {
            var that = this;
            var controls = this.getControls();
            that.fnCargaZonaManzanaInterior('TU_TIPO_MANZANA', controls.ddlTipMzBloEdi);
        },

        getDepartInter: function () {
            var that = this;
            var controls = this.getControls();
            that.fnCargaZonaManzanaInterior('TU_TIPO_INTERIOR', controls.ddlDepartInter);
        },

        chkSn_Click: function (sender, arg) {
            var that = this;
            var controls = this.getControls();
            if (sender.prop("checked")) {
                controls.txtNumber.val("S/N");
                controls.txtNumber.attr("disabled", true);
            } else {
                controls.txtNumber.val("");
                controls.txtNumber.attr("disabled", false);
            }
            that.validateControl('txtNumber');
        },

        ddlNoteCenterPopulated_Click: function () {
            var that = this;
            var controls = this.getControls();

            controls.txtCodPlane.val('');
            controls.txtCodBuilding.val('');

            //desactivamos plano y edificio
            controls.btnPlane.attr("disabled", false);
            controls.btnValBuilding.attr("disabled", false);

            var objLoadParameters = {};
            objLoadParameters.CodEstado = controls.ddlNoteDepartment.val();
            objLoadParameters.CodProvincia = controls.ddlNoteProvince.val();
            objLoadParameters.CodDistriro = controls.ddlNoteDistrict.val();
            objLoadParameters.codPoblado = controls.ddlNoteCenterPopulated.val();

            var urlBase = '/Transfer/Home/PostParamsCentroPoblados';
            $.app.ajax({
                type: 'POST',
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(objLoadParameters),
                url: urlBase,
                success: function (response) {
                }
            });

            that.validateControl('ddlNoteCenterPopulated');
        },

        AddNoteDestinationAddress_Click: function (control) {
            var that = this;
            var controls = that.getControls();
            var strDir = '';
            var ddlTipUrbResPjo = controls.ddlNoteUrbanization;
            var txtNomUrbResPjo = controls.txtNoteUrbanization;
            var ddlTipZonEta = controls.ddlNoteZote;
            var txtNomZonEta = controls.txtNoteNameZote;
            var txtRef = controls.txtNoteReference;

            strDir += (ddlTipUrbResPjo.val() != '-1' ? ddlTipUrbResPjo.val() : '');
            strDir += ($.trim(txtNomUrbResPjo.val()) != '' ? ' ' + $.trim(txtNomUrbResPjo.val()) : '');
            strDir += (ddlTipZonEta.val() != '-1' ? ' ' + ddlTipZonEta.val() : '');
            strDir += ($.trim(txtNomZonEta.val()) != '' ? ' ' + $.trim(txtNomZonEta.val()) : '');
            strDir += ($.trim(txtRef.val()) != '' ? ' ' + $.trim(txtRef.val()) : '');

            if (Session.SessionParams.DATACUSTOMER.objPostDataAccount.plataformaAT === 'TOBE') {
                /*if (txtRef.val().length > 120) 
				{
					txtRef.val(txtRef.val().slice(0,120));
				}*/
            }
            controls.txtConNotDir.text("( " + strDir.length + " / 250 Caracteres)");
            if (strDir.length > 250) {
                $('#txtNoteReference').attr('disabled', true);
                alert("Se excedió la cantidad máxima de caracteres.", "Alerta", function () {
                    $('#txtNoteReference').attr('disabled', false);

                });

            }
            else {
                // $("#divErrorAlert").hide();
            }

            controls.spnPreReference.text(controls.txtNoteReference.val());
            Session.AddressNewPreReference = controls.spnPreReference.text();

            if (control != '') {
                that.validateControl(control);
            }
            //return strDir.length;
            return strDir;
        },

        AddDestinationAddress_Click: function (control) {
            var that = this;
            var controls = that.getControls();
            var strDir = '';
            var ddlTipDir = controls.ddlStreet;
            var txtNomTipDir = controls.txtNameStreet;
            var txtNumDir = controls.txtNumber;
            var chkSN = controls.chkSN;
            var ddlTipMzBloEdi = controls.ddlTipMzBloEdi;
            var txtNroMzBloEdi = controls.txtNumberBlock;
            var txtLote = controls.txtLot;
            var ddlTipDptInt = controls.ddlDepartInter;
            var txtNumDptInt = controls.txtNumberDepartInter;

            strDir += (ddlTipDir.val() != '' ? ddlTipDir.val() : '');
            strDir += ($.trim(txtNomTipDir.val()) != '' ? ' ' + $.trim(txtNomTipDir.val()) : '');
            strDir += (txtNumDir.val() != '' ? ' ' + txtNumDir.val() : '');
            strDir += (ddlTipMzBloEdi.val() != '' ? ' ' + ddlTipMzBloEdi.val() : '');
            strDir += ($.trim(txtNroMzBloEdi.val()) != '' ? ' ' + $.trim(txtNroMzBloEdi.val()) : '');
            strDir += ($.trim(txtLote.val()) != '' ? ' LT ' + $.trim(txtLote.val()) : '');
            strDir += (ddlTipDptInt.val() != '' ? ' ' + ddlTipDptInt.val() : '');
            strDir += ($.trim(txtNumDptInt.val()) != '' ? ' ' + $.trim(txtNumDptInt.val()) : '');
            controls.txtConDir.text("( " + strDir.length + " / 250 Caracteres)");

            if (strDir.length > 250) {
                //alert("Se exedió la cantidad máxima de caracteres.", "Alerta");
                $('#txtNameStreet').attr('disabled', true);
                alert("Se excedió la cantidad máxima de caracteres.", "Alerta", function () {
                    $('#txtNameStreet').attr('disabled', false);

                });
            }
            else {
                //  $("#divErrorAlert").hide();
            }

            var PreAddressNew = (controls.ddlStreet.val() != '' ? $("#ddlStreet option:selected").html() + ' ' + controls.txtNameStreet.val() + ' ' + controls.txtNumber.val() : '');
            PreAddressNew += (controls.ddlTipMzBloEdi.val() != '' ? ', ' + $("#ddlTipMzBloEdi option:selected").html() + '  ' + controls.txtNumberBlock.val() + (controls.txtLot.val() != '' ? ", LT. " + controls.txtLot.val() : '') + '  ' : '');
            PreAddressNew += (controls.ddlDepartInter.val() != '' ? ', ' + $("#ddlDepartInter option:selected").html() + '  ' + controls.txtNumberDepartInter.val() + '  ' : '');
            controls.spnPreAddressNew.text(PreAddressNew);

            if (control != '') {
                that.validateControl(control);
            }
            //return strDir.length;
            return strDir;
        },

        btnAddPlane_Click: function () {

            var that = this;
            var controls = that.getControls();
            var urlBase = location.protocol + '//' + location.host + '/Transfer/Home/ChoosePlane';
            $.window.open({
                modal: false,
                controlBox: false,
                type: 'post',
                title: "SELECCIONAR NUEVO PLANO",
                icon: 'new-service-additional-icon',
                url: urlBase,
                width: 850,
                height: 500,
                buttons: {
                    Seleccionar: {
                        class: 'btn btn-style-default btn-sm',
                        click: function () {
                            var rowPost = $('#tblPlane').DataTable().rows({ selected: true }).data();
                            var item = rowPost[0];
                            if (item != undefined) {
                                controls.txtCodPlane.val(item.strIdPlane);
                                that.validateControl('txtCodPlane');
                                this.close();
                            } else {
                                alert("Seleccione un plano.");
                            }
                        }
                    },
                    Cancelar: {
                        click: function (sender, args) {
                            this.close();
                        }
                    }
                }
            });
        },

        btnAddBuilding_Click: function () {
            var that = this;
            var controls = that.getControls();
            var urlBase = location.protocol + '//' + location.host + '/Transfer/Home/ChooseBuilding';

            $.window.open({
                modal: false,
                controlBox: false,
                type: 'post',
                title: "SELECCIONAR NUEVO EDIFICIO",
                icon: 'new-service-additional-icon',
                url: urlBase,
                width: 850,
                height: 500,
                buttons: {
                    Seleccionar: {
                        "class": 'btn btn-danger btn-sm',
                        icon: 'new-service-additional-icon',
                        click: function () {
                            var rowPost = $('#tblBuilding').DataTable().rows({ selected: true }).data();
                            var item = rowPost[0];
                            if (item != undefined) {
                                controls.txtCodBuilding.val(item.strIdBuilding);

                                this.close();
                            } else {
                                alert("Seleccionar un Edificio");
                            }

                        }
                    },
                    Cancelar: {
                        click: function (sender, args) {
                            this.close();
                        }
                    }
                }
            });
        },

        ValidateNumbers_Click: function (e) {
            if (e.keyCode == 46 || e.keyCode == 8 || e.keyCode == 9 || e.keyCode == 27 || e.keyCode == 13 ||
                (e.keyCode == 65 && e.ctrlKey === true) || (e.keyCode >= 35 && e.keyCode <= 39))
                return;
            else
                if (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105) || e.KeyCode == 187 || e.KeyCode == 186 || e.KeyCode == 192)
                    e.preventDefault();

        },

        navigateTabs: function () {

            var that = this,
                controls = this.getControls();

            var $activeTab = $('.step.tab-pane.active');
            var stepValidation = $activeTab.attr('data-validation');

            if (typeof stepValidation !== 'undefined') {
                if (that[stepValidation]()) { navigateTabs(event) }
            }
            else {
                navigateTabs(event);
            }
        },

        AddressValidation: function () {
            var that = this;
            var controls = that.getControls();

            if ($('#ddlNoteDepartment').val() == '' || $('#ddlNoteDepartment').val() == null) {
                controls.ddlNoteDepartment.closest('.form-control').addClass('has-error');
                controls.ErrorMessageddlNoteDepartment.text('Seleccione departamento..');
                controls.ddlNoteDepartment.focus();
                return false;
            }
            else {
                controls.ErrorMessageddlNoteDepartment.closest('.form-control').removeClass('has-error');
                controls.ErrorMessageddlNoteDepartment.text('');
            }

            if ($('#ddlNoteProvince').val() == '' || $('#ddlNoteProvince').val() == null) {
                controls.ddlNoteProvince.closest('.form-control').addClass('has-error');
                controls.ErrorMessageddlNoteProvince.text('Seleccione provincia.');
                controls.ddlNoteProvince.focus();
                return false;
            }
            else {
                controls.ErrorMessageddlNoteProvince.closest('.form-control').removeClass('has-error');
                controls.ErrorMessageddlNoteProvince.text('');
            }

            if ($('#ddlNoteDistrict').val() == '' || $('#ddlNoteDistrict').val() == null) {
                controls.ddlNoteDistrict.closest('.form-control').addClass('has-error');
                controls.ErrorMessageddlNoteDistrict.text('Seleccione distrito.');
                controls.ddlNoteDistrict.focus();
                return false;
            }
            else {
                controls.ErrorMessageddlNoteDistrict.closest('.form-control').removeClass('has-error');
                controls.ErrorMessageddlNoteDistrict.text('');
            }

            if ($('#ddlNoteCenterPopulated').val() == '' || $('#ddlNoteCenterPopulated').val() == null) {
                controls.ddlNoteCenterPopulated.closest('.form-control').addClass('has-error');
                controls.ErrorMessageddlNoteCenterPopulated.text('Seleccione centro poblado.');
                controls.ddlNoteCenterPopulated.focus();
                return false;
            }
            else {
                controls.ErrorMessageddlNoteCenterPopulated.closest('.form-control').removeClass('has-error');
                controls.ErrorMessageddlNoteCenterPopulated.text('');
            }

            if ($('#ddlNoteUrbanization').val() == '') {
                controls.ddlNoteUrbanization.closest('.form-control').addClass('has-error');
                controls.ErrorMessageddlNoteUrbanization.text('Seleccione Urb./Residencial.');
                controls.ddlNoteUrbanization.focus();
                return false;
            }
            else {
                controls.ErrorMessageddlNoteUrbanization.closest('.form-control').removeClass('has-error');
                controls.ErrorMessageddlNoteUrbanization.text('');
            }

            if ($('#txtNoteUrbanization').val() == '') {
                controls.txtNoteUrbanization.closest('.form-control').addClass('has-error');
                controls.ErrorMessagetxtNoteUrbanization.text('Seleccione Urb./Residencial.');
                controls.txtNoteUrbanization.focus();
                return false;
            }
            else {
                controls.ErrorMessagetxtNoteUrbanization.closest('.form-control').removeClass('has-error');
                controls.ErrorMessagetxtNoteUrbanization.text('');
            }

            if ($('#txtCodPlane').val() == '') {
                controls.txtCodPlane.closest('.form-control').addClass('has-error');
                controls.ErrorMessagetxtCodPlane.text('Seleccione cod. plano.');
                controls.txtCodPlane.focus();
                return false;
            }
            else {
                controls.ErrorMessagetxtCodPlane.closest('.form-control').removeClass('has-error');
                controls.ErrorMessagetxtCodPlane.text('');
            }
            if ($('#ddlStreet').val() == '' || $('#ddlStreet').val() == null) {
                controls.ddlStreet.closest('.form-control').addClass('has-error');
                controls.ErrorMessageddlStreet.text('Seleccione Calle/Av/Jr/Psje.');
                controls.ddlStreet.focus();
                return false;
            }
            else {
                controls.ErrorMessageddlStreet.closest('.form-control').removeClass('has-error');
                controls.ErrorMessageddlStreet.text('');
            }

            if ($('#txtNameStreet').val() == '') {
                controls.txtNameStreet.closest('.form-control').addClass('has-error');
                controls.ErrorMessagetxtNameStreet.text('Ingrese nombre Calle/Av/Jr/Psje.');
                controls.txtNameStreet.focus();
                return false;
            }
            else {
                controls.ErrorMessagetxtNameStreet.closest('.form-control').removeClass('has-error');
                controls.ErrorMessagetxtNameStreet.text('');
            }

            if ($('#txtNumber').val() == '') {
                controls.txtNumber.closest('.form-control').addClass('has-error');
                controls.ErrorMessagetxtNumber.text('Ingrese número.');
                controls.txtNumber.focus();
                return false;
            }
            else {
                controls.ErrorMessagetxtNumber.closest('.form-control').removeClass('has-error');
                controls.ErrorMessagetxtNumber.text('');
            }

            if (that.AddDestinationAddress_Click('').length > 250) {
                return false;
            }
            if (that.AddNoteDestinationAddress_Click('').length > 250) {
                return false;
            }


            that.getWorkType(controls.txtCodPlane.val(), that.getUbigeoSeleccionado());

            return true;
        },

        schedulingValidation: function () {

            var that = this;
            var controls = that.getControls();

            if ($('#ddlWorkType').val() == '' || $('#ddlWorkType').val() == null) {
                controls.ddlWorkType.closest('.form-control').addClass('has-error');
                controls.ErrorMessageddlWorkType.text('Seleccione tipo de trabajo.');
                controls.ddlWorkType.focus();
                return false;
            }
            else {
                controls.ErrorMessageddlWorkType.closest('.form-control').removeClass('has-error');
                controls.ErrorMessageddlWorkType.text('');
            }

            if (that.TransferSession.Data.ValidaEta.FlagIndica != '0') {
                if ($('#ddlSubWorkType').val() == '' || $('#ddlSubWorkType').val() == null) {
                    controls.ddlSubWorkType.closest('.form-control').addClass('has-error');
                    controls.ErrorMessageddlSubWorkType.text('Seleccione subtipo de trabajo.');
                    controls.ddlSubWorkType.focus();
                    return false;
                }
                else {
                    controls.ErrorMessageddlSubWorkType.closest('.form-control').removeClass('has-error');
                    controls.ErrorMessageddlSubWorkType.text('');
                }
            }

            if ($('#ddlReasonSot').val() == '' || $('#ddlReasonSot').val() == null) {// controls.ddlReasonSot.val() == '' || controls.ddlReasonSot.val() == null) {
                $('#ddlReasonSot').closest('.form-control').addClass('has-error');//controls.ddlReasonSot.closest('.form-control').addClass('has-error');
                controls.ErrorMessageddlReasonSot.text('Seleccione motivo SOT.');
                controls.ddlReasonSot.focus();
                return false;
            }
            else {
                controls.ErrorMessageddlReasonSot.closest('.form-control').removeClass('has-error');
                controls.ErrorMessageddlReasonSot.text('');
            }

            var calendar = (that.KeyTab == false) ? $('#txtCalendar_Internal').val() : $('#txtCalendar').val();
            if (calendar == '' || calendar == null) {
                controls.txtCalendar.closest('.form-control').addClass('has-error');
                controls.ErrorMessagetxtCalendar.text('Ingrese fecha de programación.');
                controls.txtCalendar.focus();
                return false;
            }
            else {
                controls.ErrorMessagetxtCalendar.closest('.form-control').removeClass('has-error');
                controls.ErrorMessagetxtCalendar.text('');
            }


            var timezone = (that.KeyTab == false) ? $('#ddlTimeZone_Internal').val() : $('#ddlTimeZone').val();
            if (timezone == '' || timezone == null) {

                controls.ddlTimeZone.closest('.form-control').addClass('has-error');
                controls.ErrorMessageddlTimeZone.text('Ingrese franja horaria.');
                controls.ddlTimeZone.focus();
                return false;
            }
            else {
                controls.ErrorMessageddlTimeZone.closest('.form-control').removeClass('has-error');
                controls.ErrorMessageddlTimeZone.text('');
            }


            if (!that.onFocusoutEmail()) {
                return false;
            }
            var centerOfAttention = (that.KeyTab == false) ? $('#ddlCenterofAttention_Internal').val() : $('#ddlCenterofAttention').val();
            if (centerOfAttention == '' || centerOfAttention == null) {
                controls.ddlCenterofAttention.closest('.form-control').addClass('has-error');
                controls.ErrorMessageddlCenterofAttention.text('Seleccione punto de atención.');
                controls.ddlCenterofAttention.focus();
                return false;
            }
            else {
                controls.ErrorMessageddlCenterofAttention.closest('.form-control').removeClass('has-error');
                controls.ErrorMessageddlCenterofAttention.text('');
            }

            that.summaryValidation();
            return true;
        },

        summaryValidation: function () {

            var that = this;
            var controls = that.getControls();
            /*Set Summary*/

            $("#SmmryspnPreAddressNew").text($("#spnPreAddressNew").html());
            $("#SmmryspnPreReference").text($("#spnPreReference").html());
            $("#SmmryddlStreet").text($("#ddlStreet option:selected").html());
            $("#SmmrytxtNameStreet").text($("#txtNameStreet").val());
            $("#SmmrytxtNumber").text($("#txtNumber").val());

            var ddlTipMzBloEdi = $("#ddlTipMzBloEdi option:selected").html();
            ddlTipMzBloEdi = ddlTipMzBloEdi.trim() == "Seleccionar" ? "-" : ddlTipMzBloEdi;
            $("#SmmryddlTipMzBloEdi").text(ddlTipMzBloEdi);
            //$("#SmmryddlTipMzBloEdi").text($("#ddlTipMzBloEdi option:selected").html());

            var txtNumberBlock = $("#txtNumberBlock").val();
            txtNumberBlock = txtNumberBlock.trim() == "" ? "-" : txtNumberBlock;
            $("#SmmrytxtNumberBlock").text(txtNumberBlock);
            //$("#SmmrytxtNumberBlock").text($("#txtNumberBlock").val());

            var txtLot = $("#txtLot").val();
            txtLot = txtLot.trim() == "" ? "-" : txtLot;
            $("#SmmrytxtLot").text(txtLot);
            //$("#SmmrytxtLot").text($("#txtLot").val());

            var dep = $("#ddlDepartInter option:selected").html();
            dep = dep.trim() == "Seleccionar" ? "-" : dep;
            $("#SmmryddlDepartInter").text(dep);

            var txtNumberDepartInter = $("#txtNumberDepartInter").val();
            txtNumberDepartInter = txtNumberDepartInter.trim() == "" ? "-" : txtNumberDepartInter;
            $("#SmmrytxtNumberDepartInter").text(txtNumberDepartInter);
            //$("#SmmrytxtNumberDepartInter").text($("#txtNumberDepartInter").val());
            $("#SmmrytxtNoteReference").text($("#txtNoteReference").val());

            var MzBloqueEdif = $("#ddlNoteUrbanization option:selected").html();
            MzBloqueEdif = MzBloqueEdif.trim() == "Seleccionar" ? "-" : MzBloqueEdif;
            $("#SmmryddlNoteUrbanization").text(MzBloqueEdif);
            //$("#SmmryddlNoteUrbanization").text($("#ddlNoteUrbanization option:selected").html());

            var NombreMzBloqueEdif = $("#txtNoteUrbanization").val();
            NombreMzBloqueEdif = NombreMzBloqueEdif.trim() == "" ? "-" : NombreMzBloqueEdif;
            $("#SmmrytxtNoteUrbanization").text(NombreMzBloqueEdif);
            //$("#SmmrytxtNoteUrbanization").text($("#txtNoteUrbanization").val());
            var zon = $("#ddlNoteZote option:selected").html();
            zon = zon.trim() == "Seleccionar" ? "-" : zon;
            $("#SmmryddlNoteZote").text(zon);

            var NombreNoteNameZote = $("#txtNoteNameZote").val();
            NombreNoteNameZote = NombreNoteNameZote.trim() == "" ? "-" : NombreNoteNameZote;
            $("#SmmrytxtNoteNameZote").text(NombreNoteNameZote);

            //$("#SmmrytxtNoteNameZote").text($("#txtNoteNameZote").val());
            $("#SmmryddlNoteDepartment").text($("#ddlNoteDepartment option:selected").html());
            $("#SmmryddlNoteProvince").text($("#ddlNoteProvince option:selected").html());
            $("#SmmryddlNoteDistrict").text($("#ddlNoteDistrict option:selected").html());
            $("#SmmrytxtNoteCodePostal").text($("#txtNoteCodePostal").val());
            $("#SmmryddlNoteCenterPopulated").text($("#ddlNoteCenterPopulated option:selected").html());
            $("#SmmrytxtCodPlane").text($("#txtCodPlane").val());

            var txtCodBuilding = $("#txtCodBuilding").val();
            txtCodBuilding = txtCodBuilding.trim() == "" ? "-" : txtCodBuilding;
            $("#SmmrytxtCodBuilding").text(txtCodBuilding);
            // $("#SmmrytxtCodBuilding").text($("#txtCodBuilding").val());
            if ($('#chkUseChangeBilling').prop("checked")) {
                $("#SmmrychkUseChangeBilling").text('SI');
            } else {
                $("#SmmrychkUseChangeBilling").text('NO');
            }
            $("#SmmrytxtCalendar").text($("#txtCalendar").val());
            $("#SmmryddlTimeZone").text($("#ddlTimeZone option:selected").html());
            if ($('#chkLoyalty').prop("checked")) {
                $("#SmmrychkLoyalty").text('SI');
            } else {
                $("#SmmrychkLoyalty").text('NO');
            }
            $("#SmmrytxtChargeAmount").text($("#txtChargeAmount").val());

            if ($('#chkSendMail').prop("checked")) {
                $("#SmmrytxtSendMail").text($("#txtSendMail").val());
            } else {
                $("#SmmrytxtSendMail").text('NO');
            }
            var txtReferencePhone = $("#txtReferencePhone").val();
            txtReferencePhone = txtReferencePhone.trim() == "" ? "-" : txtReferencePhone;
            $("#SmmrytxtReferencePhone").text(txtReferencePhone);
            //$("#SmmrytxtReferencePhone").text($("#txtReferencePhone").val());
            $("#SmmryddlCenterofAttention").text($("#ddlCenterofAttention option:selected").html());
        },

        InternalValidation: function () {
            var that = this;
            var controls = that.getControls();

            if ($('#ddlWorkType_Internal').val() == '' || $('#ddlWorkType_Internal').val() == null) {
                controls.ddlWorkType.closest('.form-control').addClass('has-error');
                controls.ErrorMessageddlWorkTypeInternal.text('Seleccione tipo de trabajo.');
                controls.ddlWorkType.focus();
                return false;
            }
            else {
                controls.ErrorMessageddlWorkTypeInternal.closest('.form-control').removeClass('has-error');
                controls.ErrorMessageddlWorkTypeInternal.text('');
            }

            if (that.TransferSession.Data.ValidaEta.FlagIndica != '0') {
                if ($('#ddlSubWorkType_Internal').val() == '' || $('#ddlSubWorkType_Internal').val() == null) {
                    $('#ddlSubWorkType_Internal').closest('.form-control').addClass('has-error');
                    controls.ErrorMessageddlSubWorkTypeInternal.text('Seleccione subtipo de trabajo.');
                    $('#ddlSubWorkType_Internal').focus();
                    return false;
                }
                else {
                    controls.ErrorMessageddlSubWorkTypeInternal.closest('.form-control').removeClass('has-error');
                    controls.ErrorMessageddlSubWorkTypeInternal.text('');
                }
            }

            if ($('#ddlReasonSot_Internal').val() == '' || $('#ddlReasonSot_Internal').val() == null) {
                $('#ddlReasonSot_Internal').closest('.form-control').addClass('has-error');
                controls.ErrorMessageddlReasonSotInternal.text('Seleccione motivo SOT.');
                $('#ddlReasonSot_Internal').focus();
                return false;
            }
            else {
                controls.ErrorMessageddlReasonSotInternal.closest('.form-control').removeClass('has-error');
                controls.ErrorMessageddlReasonSotInternal.text('');
            }

            // var calendar = (that.KeyTab == false) ? $('#txtCalendar_Internal').val() : $('#txtCalendar').val();
            if ($('#txtCalendar_Internal').val() == '' || $('#txtCalendar_Internal').val() == null) {
                $('#txtCalendar_Internal').closest('.form-control').addClass('has-error');
                controls.ErrorMessagetxtCalendarInternal.text('Ingrese fecha de programación.');
                $('#txtCalendar_Internal').focus();
                return false;
            }
            else {
                controls.ErrorMessagetxtCalendarInternal.closest('.form-control').removeClass('has-error');
                controls.ErrorMessagetxtCalendarInternal.text('');
            }


            //var timezone = (that.KeyTab == false) ? $('#ddlTimeZone_Internal').val() : $('#ddlTimeZone').val();

            if ($('#ddlTimeZone_Internal').val() == '' || $('#ddlTimeZone_Internal').val() == null) {

                $('#ddlTimeZone_Internal').closest('.form-control').addClass('has-error');
                controls.ErrorMessageddlTimeZoneInternal.text('Ingrese franja horaria.');
                $('#ddlTimeZone_Internal').focus();
                return false;
            }
            else {
                controls.ErrorMessageddlTimeZoneInternal.closest('.form-control').removeClass('has-error');
                controls.ErrorMessageddlTimeZoneInternal.text('');
            }


            if (!that.onFocusoutEmail()) {
                return false;
            }

            if ($('#ddlCenterofAttention_Internal').val() == '' || controls.ddlCenterofAttention.val() == null) {
                $('#ddlCenterofAttention_Internal').closest('.form-control').addClass('has-error');
                controls.ErrorMessageddlCenterofAttentionInternal.text('Seleccione punto de atención.');
                $('#ddlCenterofAttention_Internal').focus();
                return false;
            }
            else {
                controls.ErrorMessageddlCenterofAttentionInternal.closest('.form-control').removeClass('has-error');
                controls.ErrorMessageddlCenterofAttentionInternal.text('');
            }
            return true;
        },

        onFocusoutEmail: function () {

            var that = this,
                controls = this.getControls(),
                filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

            if (controls.chkSendMail.is(':checked')) {
                var mail = (that.KeyTab == false) ? $('#txtSendMail_Internal').val() : $('#txtSendMail').val()
                if (!filter.test(mail)) {
                    controls.txtSendMail.closest('.form-control').addClass('has-error');
                    controls.ErrorMessagetxtSendMail.text('Ingrese una dirección de correo válida.');
                    controls.txtSendMail.focus();
                    return false;
                }
                else {
                    controls.ErrorMessagetxtSendMail.closest('.form-control').removeClass('has-error');
                    controls.ErrorMessagetxtSendMail.text('');
                    return true;
                }
            }

            return true;
        },

        btnValidateCoverage_click: function () {

            var that = this;
            var controls = that.getControls();

            var urlBase = location.protocol + '//' + location.host + '/Transfer/Home/ConsultationCoverage';
            $.window.open({
                modal: false,
                controlBox: false,
                type: 'post',
                title: "Validar cobertura",
                icon: 'new-plan-icon',
                url: urlBase,
                width: 900,
                height: 600,
                buttons: {
                    Aceptar: {
                        class: 'btn btn-style-default btn-sm',
                        click: function (sender, args) {
                            this.close();
                        }
                    },
                }
            });

        },

        loadCargaInicial: function (transaccion, proceso, contratoId, tipoInterior) {
            var that = this,
                controls = this.getControls();

            that.getLoadingPage();
            var plano = controls.txtCodPlane.val(), ubigeo = that.getUbigeoSeleccionado();

            var objLoadParameters = {};
            objLoadParameters.strIdSession = Session.UrlParams.IdSession;
            objLoadParameters.IdTransaccion = transaccion;
            objLoadParameters.IdProceso = proceso;
            objLoadParameters.IdProducto = that.TransferSession.Data.Technology;
            objLoadParameters.CodPais = "51";
            objLoadParameters.IdTipoUrba = "0";
            objLoadParameters.ContratoId = contratoId;
            objLoadParameters.IdTipoInt = tipoInterior;
            objLoadParameters.IdCodVia = "0";
            objLoadParameters.tecnologia = that.TransferSession.Data.Technology;
            objLoadParameters.Ubigeo = (plano == '') ? that.TransferSession.Data.Instalation.Ubigeo : ubigeo;//"150114";//
            objLoadParameters.IdPlano = (plano == '') ? that.TransferSession.Data.Instalation.CodPlano : plano;//"LAMO088-F";//
            objLoadParameters.TipoServicio = that.TransferSession.Configuration.Constants.Constantes_Tipservicio; //"0061";//
            objLoadParameters.Origen = that.TransferSession.Configuration.Constants.Constantes_Origen;//"P";//
            objLoadParameters.TipTrabajo = (that.KeyTab) ? that.TransferSession.Configuration.Constants.Constantes_TE_Tipotrabajo : that.TransferSession.Configuration.Constants.Constantes_TI_Tipotrabajo
            objLoadParameters.TipTra = (that.KeyTab) ? that.TransferSession.Configuration.Constants.Constantes_TE_Tipotrabajo : that.TransferSession.Configuration.Constants.Constantes_TI_Tipotrabajo;//"1018";//

            $.app.ajax({
                type: 'POST',
                contentType: "application/json; charset=utf-8",
                url: '/Transfer/Home/GetDatosAdicionales',
                data: JSON.stringify(objLoadParameters),
                success: function (response) {

                    that.getNoteDepartment();
                    that.getNoteUrbanization();
                    that.getNoteZote();
                    that.getStreet();
                    that.getTipMzBloEdi();
                    that.getDepartInter();
                    $.reusableBusiness.LoadPointOfAttention(controls.ddlCenterofAttention, that.TransferSession);
                    controls.ddlNoteProvince.attr('disabled', true);
                    controls.ddlNoteDistrict.attr('disabled', true);
                    controls.ddlNoteCenterPopulated.attr('disabled', true);
                },
                error: function (ex) {
                }
            });
        },

        loadCargaFranjaHorario: function (
            flagValidaEta,
            tipoTrabajo,
            fechaAgenda,
            origen,
            idPlano,
            ubigeo,
            tipoServicio,
            tipoOrden,
            subtipoOrden,
            codZona,
            customer,
            contrato,
            reglaValidacion,
            listaCampoActividadCapacidad
        ) {
            var that = this,
                controls = this.getControls();
            var objLoadParameters = {};
            objLoadParameters.flagValidaEta = flagValidaEta;
            objLoadParameters.disponibilidad = $("#ddlSubWorkType option:selected").attr("disponibilidad");
            objLoadParameters.tipTra = tipoTrabajo;
            objLoadParameters.tipSrv = tipoServicio
            objLoadParameters.fechaAgenda = fechaAgenda;
            objLoadParameters.origen = origen;
            objLoadParameters.idPlano = idPlano;
            objLoadParameters.ubigeo = ubigeo;
            objLoadParameters.tipoOrden = tipoOrden;
            objLoadParameters.subtipoOrden = subtipoOrden;
            objLoadParameters.codZona = codZona;
            objLoadParameters.customer = customer;
            objLoadParameters.contrato = contrato;
            objLoadParameters.reglaValidacion = reglaValidacion;
            objLoadParameters.listaCampoActividadCapacidad = listaCampoActividadCapacidad;

            $.app.ajax({
                type: 'POST',
                contentType: "application/json; charset=utf-8",
                url: '/Transfer/Home/GetDatosFranjaHorario',
                data: JSON.stringify(objLoadParameters),
                success: function (response) {

                    var plano = controls.txtCodPlane.val(), ubigeo = that.getUbigeoSeleccionado();//a.b. Neil.
                    // that.createDropdownFillFranja(response, controls.ddlTimeZone);
                    (plano == '') ? that.createDropdownFillFranja(response, $("#ddlTimeZone_Internal")) : that.createDropdownFillFranja(response, $("#ddlTimeZone")),
                    $.unblockUI();
                },
                error: function (ex) {
                }
            }
            );
        },

        createDropdownFillFranja: function (response, objeto) {
            objeto.empty();

            var that = this;
            objeto.append($('<option>', { value: '', html: 'Seleccionar' }));

            if (response.dataCapacity.MessageResponse.Body.listaFranjaHorarioCapacity != null) {
                var i = 0;
                $.each(response.dataCapacity.MessageResponse.Body.listaFranjaHorarioCapacity, function (index, value) {
                    if (value.Estado == 'RED') {
                        objeto.append('<option idHorario="' + value.Descripcion2.split('-')[0] + '" style="background-color: #E60000; color:#ffffff" value="' + value.Codigo + '" Disabled>' + value.Descripcion + '</option>');
                    }
                    else {

                        objeto.append('<option idHorario="' + value.Descripcion2.split('-')[0] + '" idConsulta="' + value.Codigo2 + '" Franja="' + value.Codigo + '" idBucket="' + value.Codigo3 + '" style="background-color: #FFFFFF;" value="' + value.Codigo + '+' + value.Codigo3 + '">' + value.Descripcion + '</option>');
                        //value.Codigo :vFranja  - xejmpl: AM2
                        //value.Codigo2: idConsulta- xejmpl: 7176588
                        //value.Codigo3: idBucket - xejmpl: I_CARLEI_SUR_FTTH_ZC .....  09:00-11:00 x
                        //value.descripcion: 11am a 1pm
                        //value.descripcion2: 09:00-11:00
                    }
                });
            }

            if (response.dataCapacity.MessageResponse.Body.listaFranjaHorarioSga != null) {
                $.each(response.dataCapacity.MessageResponse.Body.listaFranjaHorarioSga, function (index, value) {

                    if (value.Codigo == null) //Debe retorna el servicio
                        objeto.append($('<option>', { value: value.Descripcion, html: value.Descripcion }));
                    else
                        objeto.append($('<option>', { value: value.Descripcion, html: value.Descripcion }));

                });
            }

            if (response.dataCapacity.MessageResponse.Body.listaFranjaHorarioXml != null) {
                $.each(response.dataCapacity.MessageResponse.Body.listaFranjaHorarioXml, function (index, value) {

                    if (value.Codigo == null) //Debe retorna el servicio
                        objeto.append($('<option>', { value: value.Descripcion, html: value.Descripcion }));
                    else
                        objeto.append($('<option>', { value: value.Codigo, html: value.Descripcion }));

                });
            }
        },

        ddlNoteDepartment_Click: function () {
            var that = this,
                controls = that.getControls();
            controls.ddlNoteProvince.empty();
            controls.ddlNoteDistrict.empty();
            controls.ddlNoteCenterPopulated.empty();//se agrego por la observacion de Sergio

            if (controls.ddlNoteDepartment.val() != '')
                that.GetProvinces(controls.ddlNoteDepartment.val());
            else {
                controls.ddlNoteProvince.prop("disabled", true);
                controls.ddlNoteDistrict.prop("disabled", true);
                controls.ddlNoteCenterPopulated.prop("disabled", true);
            }
            that.validateControl('ddlNoteDepartment');
        },

        ddlNoteProvince_Click: function () {
            var that = this,
                controls = that.getControls();
            controls.ddlNoteCenterPopulated.empty();//se agrego por la observacion de Sergio
            controls.ddlNoteDistrict.empty();
            // that.GetDistritos(controls.ddlNoteDepartment.val(), controls.ddlNoteProvince.val());
            // that.validateControl('ddlNoteProvince');

            if (controls.ddlNoteProvince.val() != '')
                that.GetDistritos(controls.ddlNoteDepartment.val(), controls.ddlNoteProvince.val());
            else {
                //controls.ddlNoteProvince.prop("disabled",true);
                controls.ddlNoteDistrict.prop("disabled", true);
                controls.ddlNoteCenterPopulated.prop("disabled", true);
            }
            that.validateControl('ddlNoteProvince');
        },

        ddlNoteDistrict_Click: function () {
            var that = this,
                controls = that.getControls();
            var objLoadParameters = {};
            objLoadParameters.CodEstado = controls.ddlNoteDepartment.val();
            objLoadParameters.CodProvincia = controls.ddlNoteProvince.val();
            objLoadParameters.CodDistriro = controls.ddlNoteDistrict.val();
            objLoadParameters.tipoProducto = that.TransferSession.Data.Technology;
            if (controls.ddlNoteDistrict.val() == '') {
                controls.ddlNoteCenterPopulated.empty();
                controls.ddlNoteCenterPopulated.attr('disabled', true);
                $.unblockUI();
                return false;
            }
            that.getLoadingPage();
            var urlBase = '/Transfer/Home/GetCentroPoblados';
            $.app.ajax({
                type: 'POST',
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(objLoadParameters),
                url: urlBase,
                success: function (response) {
                    controls.ddlNoteCenterPopulated.attr('disabled', false);
                    that.createDropdownFill(response.data, controls.ddlNoteCenterPopulated, true);
                    $.unblockUI();
                }
            });

            that.validateControl('ddlNoteDistrict');
        },

        getRequestGeneral: function (idproceso, codUbi, ubigeo, idpoblado, idplano) {
            var that = this, oRequest = {};
            return oRequest = {
                // IdTransaccion: "3",
                IdTransaccion: that.TransferSession.Data.idTransactionFront,
                IdProceso: idproceso,
                IdProducto: that.TransferSession.Data.Technology,
                CodPais: "51",
                IdTipoUrba: "0",
                ContratoId: Session.SessionParams.DATACUSTOMER.ContractID,
                IdTipoInt: "TODOS",
                IdCodVia: "0",
                CodUbi: codUbi,
                Ubigeo: ubigeo,
                IdPoblado: idpoblado,
                TipTrabajo: (that.KeyTab) ? that.TransferSession.Configuration.Constants.Constantes_TE_Tipotrabajo : that.TransferSession.Configuration.Constants.Constantes_TI_Tipotrabajo, // tiptrabajo,
                FlagCE: "C",
                TipoServicio: that.TransferSession.Configuration.Constants.Constantes_Tipservicio,
                TipTra: (that.KeyTab) ? that.TransferSession.Configuration.Constants.Constantes_TE_Tipotrabajo : that.TransferSession.Configuration.Constants.Constantes_TI_Tipotrabajo, //tiptrabajo,
                Origen: "P",
                IdPlano: idplano,
                tecnologia: that.TransferSession.Data.Technology,
                cantDeco: '0'
            };

        },

        getUbigeoSeleccionado: function () {
            var that = this,
            controls = that.getControls();
            var xubigeo = that.TransferSession.Data.Ubigeos.filter(function (d) {
                return d.CodEstado === controls.ddlNoteDepartment.val() &&
                     d.CodProvincia === controls.ddlNoteProvince.val() &&
                     d.CodDistrito === controls.ddlNoteDistrict.val();
            });
            var xubigeoUnico = $.unique(xubigeo.map(function (d) {
                return d.Ubigeo;
            }))
            return xubigeoUnico[0];
        },

        ///Carga de TipoTrabajo
        GetTipoTrabajo: function (plano, ubigeo) {
            var that = this,
                controls = that.getControls();
            var oRequest = {};

            oRequest = that.getRequestGeneral("3", "codubi", ubigeo, "idpoblado", plano);

            var urlBase = '/Transfer/Home/GetTiposDeTrabajo';
            $.app.ajax({
                type: 'POST',
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(oRequest),
                url: urlBase,
                success: function (response) {
                    controls.ddlWorkType.empty();
                    controls.ddlWorkType.append($('<option>', { value: '', html: '-Seleccionar-' }));
                    var tiptrabajo = (that.KeyTab) ? that.TransferSession.Configuration.Constants.Constantes_TE_Tipotrabajo : that.TransferSession.Configuration.Constants.Constantes_TI_Tipotrabajo

                    $.each(response.SelectListTipoTrabajo, function (index, value) {
                        if (value.Code == tiptrabajo) {
                            controls.ddlWorkType.append($('<option>', { value: value.Code, html: value.Description, selected: true }));
                            controls.ddlWorkType.attr('disabled', true);
                        } else {
                            controls.ddlWorkType.append($('<option>', { value: value.Code, html: value.Description }));
                        }

                    });
                    that.getSubWorkType(response);
                    that.GetTipoMotivos(response);

                    that.TransferSession.Data.ValidaEta = response.listValidaEta;

                    if (that.TransferSession.Data.ValidaEta.FlagIndica == null || that.TransferSession.Data.ValidaEta.FlagIndica == '0') {
                        alert("No aplica agendamiento en línea, favor de continuar con la operación.", "Alerta");
                        that.TransferSession.Data.ValidaEta.FlagIndica = '0';
                    }

                    $.unblockUI();
                }
            });

        },

        ///Sub Tipo de Trabajo
        getSubWorkType: function (response) {
            var that = this;
            var controls = this.getControls();

            controls.ddlSubWorkType.empty();
            controls.ddlSubWorkType.append($('<option>', { value: '', html: '-Seleccionar-' }));
            var flg = false;
            $.each(response.SelectListSubTipoTrabajo, function (index, value) {
                if (value.Code3 == "1") {// flag defecto                     
                    controls.ddlSubWorkType.append('<option selected = "selected"  idTipoServicio = "' + value.Code2 + '" CodTipoOrden = "' + value.IdMotive + '" CodTipoSubOrden = "' + value.Type + '" disponibilidad = "' + value.Description2 + '" value  = "' + value.Code + '" >' + value.Description + '</option>');
                    flg = true;
                } else {
                    controls.ddlSubWorkType.append('<option idTipoServicio = "' + value.Code2 + '" CodTipoOrden = "' + value.IdMotive + '" CodTipoSubOrden = "' + value.Type + '" disponibilidad = "' + value.Description2 + '" value  = "' + value.Code + '" >' + value.Description + '</option>');
                }

                if (flg) {
                    controls.ddlSubWorkType.attr('disabled', true);
                }
            });

        },

        ///Carga de Motivos
        GetTipoMotivos: function (response) {
            var that = this,
                controls = that.getControls();
            controls.ddlReasonSot.empty();
            controls.ddlReasonSot.append($('<option>', { value: '', html: '-Seleccionar-' }));
            var MotivoSot = (that.KeyTab) ? that.TransferSession.Configuration.Constants.Constantes_TE_MotivoSot : that.TransferSession.Configuration.Constants.Constantes_TI_MotivoSot
            $.each(response.SelectListMotivos, function (index, value) {

                if (value.Code == MotivoSot) {
                    //if (value.Description.indexOf("FTTH/SIAC") > -1) {    //1052	FTTH/SIAC - A SOLICITUD DEL CLIENTE  ==> FILTRAR POR ESTO EN "Constantes_MotivoSot"
                    controls.ddlReasonSot.append($('<option>', { value: value.Code, html: value.Description, selected: true }));
                    controls.ddlReasonSot.attr('disabled', true);
                }
                else {
                    controls.ddlReasonSot.append($('<option>', { value: value.Code, html: value.Description }));
                }

            });
        },

        UnicosItems: function (items) {
            $.unique(items.map(function (d) {
                return d.CodEstado;
            }));
        },

        ///Carga de Departamentos
        GetDepartaments: function () {
            var that = this,
                controls = that.getControls();
            var ubigeos = that.TransferSession.Data.Ubigeos;

            var r = $.unique(ubigeos.map(function (d) {
                return d.CodEstado;
            }))

            var data = [];

            r.filter(function (p) {
                var lm = that.TransferSession.Data.Ubigeos.filter(function (d) {
                    return d.CodEstado === p && d.CodEstado != null;;;
                })[0];
                var selectlist = {
                    Code: lm.CodEstado,
                    Description: lm.NomEstado
                }
                data.push(selectlist)
            });

            that.createDropdownFill(data, controls.ddlNoteDepartment, true);

        },

        ///Carga de Provincias
        GetProvinces: function (strDepartments) {

            var that = this,
                controls = that.getControls();
            var objLoadParameters = {};
            objLoadParameters.CodEstado = strDepartments;
            var data = [];

            var provincias = that.TransferSession.Data.Ubigeos.filter(function (d) {
                return d.CodEstado === strDepartments && d.CodProvincia != null;
            });

            var xprovincias = $.unique(provincias.map(function (d) {
                return d.CodProvincia;
            }))


            xprovincias.filter(function (p) {

                var field = provincias.filter(function (filtro) {
                    return filtro.CodEstado === strDepartments && filtro.CodProvincia === p;
                })[0];
                var selectlist = {
                    Code: field.CodProvincia,
                    Description: field.NomProvincia
                }
                data.push(selectlist)

            });
            controls.ddlNoteProvince.attr('disabled', false);
            that.createDropdownFill(data, controls.ddlNoteProvince, true);

        },

        ///Carga de Distritos
        GetDistritos: function (strEstado, strProvinces) {
            var that = this,
                controls = that.getControls();
            var objLoadParameters = {};
            objLoadParameters.CodEstado = strEstado;
            objLoadParameters.CodProvincia = strProvinces;

            var data = [];

            var distritos = that.TransferSession.Data.Ubigeos.filter(function (d) {
                return d.CodEstado === strEstado && d.CodProvincia === strProvinces && d.CodDistrito != null;
            });

            var xdistritos = $.unique(distritos.map(function (d) {
                return d.CodDistrito;
            }))

            xdistritos.filter(function (p) {

                var field = distritos.filter(function (filtro) {
                    return filtro.CodEstado === strEstado && filtro.CodProvincia === strProvinces && filtro.CodDistrito === p;
                })[0];
                var selectlist = {
                    Code: field.CodDistrito,
                    Description: field.NomDistrito
                }
                data.push(selectlist)

            });
            controls.ddlNoteDistrict.attr('disabled', false);
            that.createDropdownFill(data, controls.ddlNoteDistrict, true);

        },

        ReservaTOA: function (nroOrden) {
            var that = this,
             controls = that.getControls(), plano = controls.txtCodPlane.val();


            var objLoadParameters = {};
            objLoadParameters.flagValidaETA = that.TransferSession.Data.ValidaEta.FlagIndica;//that.TransferSession.Data.ValidaEta.FlagReserva;
            objLoadParameters.tiptra = (plano == '') ? $("#ddlWorkType_Internal").val() : $("#ddlWorkType").val(), //controls.ddlWorkType.val();
            objLoadParameters.tipSrv = (plano == '') ? $("#ddlSubWorkType_Internal option:selected").attr("idtiposervicio") : $("#ddlSubWorkType option:selected").attr("idtiposervicio"), //$("#ddlSubWorkType option:selected").attr("idtiposervicio");
            objLoadParameters.nroOrden = nroOrden;
            objLoadParameters.fechaReserva = (that.KeyTab == false) ? $('#txtCalendar_Internal').val() : $('#txtCalendar').val();//controls.txtCalendar.val();
            objLoadParameters.idBucket = (plano == '') ? ($("#ddlTimeZone_Internal option:selected").attr('idBucket') == undefined ? '' : $("#ddlTimeZone_Internal option:selected").attr('idBucket')) :
                                                        ($("#ddlTimeZone option:selected").attr('idBucket') == undefined ? '' : $("#ddlTimeZone option:selected").attr('idBucket'));
            objLoadParameters.codZona = that.TransferSession.Data.ValidaEta.CodigoZona;//controls.ddlNoteZote.val();
            objLoadParameters.idPlano = (plano == '') ? that.TransferSession.Data.Instalation.CodPlano : plano;
            objLoadParameters.tipoOrden = (plano == '') ? $("#ddlSubWorkType_Internal option:selected").attr("CodTipoOrden") : $("#ddlSubWorkType option:selected").attr("CodTipoOrden"),
            objLoadParameters.codSubTipoOrden = (plano == '') ? $("#ddlSubWorkType_Internal").val() : $("#ddlSubWorkType").val(),// controls.ddlSubWorkType.val()
            objLoadParameters.idConsulta = (plano == '') ? $("#ddlTimeZone_Internal option:selected").attr('idConsulta') == undefined ? '' : $("#ddlTimeZone_Internal option:selected").attr('idConsulta') :
                                                        $("#ddlTimeZone option:selected").attr('idConsulta') == undefined ? '' : $("#ddlTimeZone option:selected").attr('idConsulta');
            objLoadParameters.franjaHoraria = (plano == '') ? ($("#ddlTimeZone_Internal option:selected").attr('franja') == undefined ? '' : $("#ddlTimeZone_Internal option:selected").attr('franja')) :
                                                                ($("#ddlTimeZone option:selected").attr('franja') == undefined ? '' : $("#ddlTimeZone option:selected").attr('franja'));// "PM2";
            objLoadParameters.duracion = (plano == '') ? $("#ddlSubWorkType_Internal option:selected").attr("disponibilidad") : $("#ddlSubWorkType option:selected").attr("disponibilidad"); //$("#ddlSubWorkType option:selected").attr("disponibilidad");//20;

            var urlBase = '/Transfer/Home/GestionarReservaTOA';
            $.app.ajax({
                type: 'POST',
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(objLoadParameters),
                url: urlBase,
                success: function (response) {

                    if (response != null) {
                        that.TransferSession.Configuration.Constants.nroOrdenTOA = response.oDataResponse.nroOrden;
                        that.countdown(response.oDataResponse.nroOrden)
                    }
                    else {
                        alert('No se pudo ejecutar la reseva del horario. Por favor vuelva a intentar')
                    }
                    ///$.unblockUI();
                }

            });


        },

        CancelarTOA: function (nroOrden) {
            var that = this,
             controls = that.getControls();

            var objLoadParameters = {};
            objLoadParameters.nroOrden = nroOrden;
            var urlBase = '/Transfer/Home/GestionarCancelarTOA';
            $.app.ajax({
                type: 'POST',
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(objLoadParameters),
                url: urlBase,
                success: function (response) {

                    if (response != null) {

                    }

                }
            });


        },

        ddlTimeZone_Click: function () {
            var that = this,
                controls = that.getControls();

            //Reserva TOA
            //FlagReserva=>> SI APLICA RESERVA O NO EL AGENDAMIENTO
            //FlagIndica=>>SI APLICA  ETA TRAE CAPACIDAD DESDE TOA, SI NO DESDE UN XML
            if (that.TransferSession.Data.ValidaEta.FlagReserva != '0') {
                that.ReservaTOA(that.TransferSession.Configuration.Constants.nroOrdenTOA);
                //that.countdown();    
            }
            var calendar = "";

            if (that.KeyTab) {
                calendar = $('#txtCalendar').val();

                if (calendar == '' || calendar == null) {
                    $('#txtCalendar').closest('.form-control').addClass('has-error');
                    $('#ErrorMessagetxtCalendar').text('Ingrese fecha de programación.');
                    $('#txtCalendar').focus();
                    return false;
                } else {
                    $('#ErrorMessageddlTimeZone').closest('.form-control').removeClass('has-error');
                    $('#ErrorMessageddlTimeZone').text('');
                }

            } else {
                calendar = $('#txtCalendar_Internal').val();

                if (calendar == '' || calendar == null) {
                    $('#txtCalendar_Internal').closest('.form-control').addClass('has-error');
                    $('#ErrorMessagetxtCalendar_Internal').text('Ingrese fecha de programación.');
                    $('#txtCalendar_Internal').focus();
                    return false;
                } else {
                    $('#ErrorMessageddlTimeZone_Internal').closest('.form-control').removeClass('has-error');
                    $('#ErrorMessageddlTimeZone_Internal').text('');
                }
            }
        },

        countdown: function (nroOrden) {
            var that = this;
            var controls = this.getControls();

            var STR_TIMER_FRANJA = that.TransferSession.Configuration.Constants.Constantes_TimerFranjaHorario; //Configurable
            $('#countdown').show();
            var momentOfTime = new Date();
            var myTimeSpan = STR_TIMER_FRANJA * 60 * 1000;
            momentOfTime.setTime(momentOfTime.getTime() + myTimeSpan);
            var countDownDate = momentOfTime;

            var finalize = false;
            //clearInterval(x);
            var x = setInterval(function () {
                var now = new Date().getTime();
                var distance = countDownDate - now;
                var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                $("#countdown p").html(minutes + "m " + seconds + "s ");
                if (that.stopCountDown) clearInterval(x);
                if (distance < 0) {
                    //  clearInterval(x);
                    $("#countdown p").html("Tiempo expirado");
                    //Cuando se expira el tiempo cancelamos la reserva TOA anterior
                    finalize = true;
                    alert("El tiempo de la reserva del horario ha expirado. Por favor seleccione un nuevo horario", "Alerta");

                    ///INICIO DE LINEAS AGREGADAS 
                    //MIGUEL ANTON
                    if (finalize) {
                        //CANCELAMOS LA RESERVA TOA
                        that.CancelarTOA(nroOrden);
                        //FINALIZAMOS LA SALIDA DEL TIMER. ANTES DE QUEDABA CICLADO :O
                        clearInterval(x)


                        var fechaSeleccionada = (that.KeyTab == false) ? $('#txtCalendar_Internal').val() : $('#txtCalendar').val();//controls.txtCalendar.val();
                        var plano = controls.txtCodPlane.val(), ubigeo = that.getUbigeoSeleccionado();//a.b. Neil.
                        var ActivityCapacity = [
                           { "nombre": "XA_Map", "valor": that.PadLeft((plano == '') ? that.TransferSession.Data.Instalation.CodPlano : plano, 10) }, //000LMSQ090 //"000L14001V"
                           { "nombre": "XA_WorkOrderSubtype", "valor": (plano == '') ? $("#ddlSubWorkType_Internal").val() : $("#ddlSubWorkType").val() },//// HFCPTI01
                           { "nombre": "XA_Zone", "valor": that.TransferSession.Data.ValidaEta.CodigoZona }//3133
                        ];


                        that.getLoadingPage();
                        that.loadCargaFranjaHorario(
                          that.TransferSession.Data.ValidaEta.FlagIndica,
                          (plano == '') ? $("#ddlWorkType_Internal").val() : $("#ddlWorkType").val(),//controls.ddlWorkType.val(),
                          fechaSeleccionada,
                          that.TransferSession.Configuration.Constants.Constantes_Origen,
                          (plano == '') ? that.TransferSession.Data.Instalation.CodPlano : plano, //"AQSB003","LMSQ090"
                          (plano == '') ? that.TransferSession.Data.Instalation.Ubigeo : ubigeo,//ubigeo
                          (plano == '') ? $("#ddlSubWorkType_Internal option:selected").attr("idtiposervicio") : $("#ddlSubWorkType option:selected").attr("idtiposervicio"),
                          (plano == '') ? $("#ddlSubWorkType_Internal option:selected").attr("CodTipoOrden") : $("#ddlSubWorkType option:selected").attr("CodTipoOrden"),
                          (plano == '') ? $("#ddlSubWorkType_Internal").val() : $("#ddlSubWorkType").val(),//controls.ddlSubWorkType.val(),
                          that.TransferSession.Data.ValidaEta.CodigoZona,
                          Session.SessionParams.DATACUSTOMER.CustomerID,
                          Session.SessionParams.DATACUSTOMER.ContractID,
                          that.TransferSession.Configuration.Constants.Constantes_ReglaValidacion,
                          ActivityCapacity
                      );

                        $.unblockUI();
                    }
                    //FIN DE LINEAS AGREGADAS
                    //MIGUEL ANTON

                    ////       CancelarTOA();

                }
            }, 1000);


        },

        divTransferInternal_Click: function () {
            var that = this,
                controls = that.getControls(),
                txtPlano = $('#txtCodPlane').val();

            if (txtPlano == undefined || txtPlano == '') {
                that.KeyTab = false;
                $('#divInternalTransfer').show();
                $('#divExternalTransfer').hide();
                controls.divTransferInternal.removeClass("divNoSelect-transfer");
                controls.divTransferExternal.removeClass("divSelect-transfer");
                controls.divTransferInternal.addClass("divSelect-transfer");
                controls.divTransferExternal.addClass("divNoSelect-transfer");
                //$("#idNextStep").removeClass("next-step");
                $(".save-internal").show();
                //$('.next-step').hide();
                $('.Save-step').hide();
                $('.Constancy-step').hide();
                $('.prev-step').hide();
                $('.next-step').hide();

            }

        },

        navigateIcons: function () {
            var that = this,
                controls = this.getControls();

            event.stopImmediatePropagation();

            var $activeTab = $('.step.tab-pane.active');
            var $previousButton = $(string.format('button[href="#{0}"]', $activeTab.attr('id')));
            var $currentButton = event.target ? $(event.target) : $(event.srcElement);
            var target = string.format('#{0}', $currentButton.attr('id'));

            while ($previousButton.attr('index') < $currentButton.attr('index')) {

                var stepValidation = $activeTab.attr('data-validation');

                if (typeof stepValidation !== 'undefined' && stepValidation !== '') {

                    if (!that[stepValidation]()) {
                        target = string.format('#{0}', $previousButton.attr('id'));
                        $previousButton = $currentButton;
                    }
                    else {
                        $activeTab = $activeTab.next('.tab-pane');
                        $previousButton = $(string.format('button[href="#{0}"]', $activeTab.attr('id')));
                    }
                }
                else {
                    $activeTab = $activeTab.next('.tab-pane');
                    $previousButton = $(string.format('button[href="#{0}"]', $activeTab.attr('id')));
                }

            }

            navigateIcons(target);
        },

        divTransferExternal_Click: function () {
            var that = this;
            var controls = that.getControls();

            that.KeyTab = true;
            $("#tabAddress").addClass("in");
            $(".btn-Top-right").show();
            $('#divExternalTransfer').show();
            $('#divInternalTransfer').hide();
            $(".save-internal").hide();
            $(".next-step").show();
            controls.divTransferInternal.removeClass("divSelect-transfer");
            controls.divTransferExternal.removeClass("divNoSelect-transfer");
            controls.divTransferInternal.addClass("divNoSelect-transfer");
            controls.divTransferExternal.addClass("divSelect-transfer");
        },

        getLoadingPage: function () {
            var strUrlLogo = window.location.protocol + '//' + window.location.host + '/Content/images/SUFija/loading_Claro.gif';
            $.blockUI({
                message: '<div align="center"><img src="' + strUrlLogo + '" width="25" height="25" /> Cargando ... </div>',
                css: {
                    border: 'none',
                    padding: '15px',
                    backgroundColor: '#000',
                    '-webkit-border-radius': '10px',
                    '-moz-border-radius': '10px',
                    opacity: .5,
                    color: '#fff',
                }
            });
        },

        stopCountDown: false,

        Save_click: function () {
            var that = this,
                validacion = (that.KeyTab) ? true : that.InternalValidation();

            if (validacion) {
                confirm("¿Esta seguro de guardar los cambios?", null, function () {
                    that.stopCountDown = true;
                    $('#countdown').css('display', 'none');
                    that.getLoadingPage();
                    that.GuardarDatos();
                });
            }
        },

        getXMLTramaConstancia: function () {
            var that = this,
                controls = that.getControls();

            var feed = "";
            feed += "<FORMATO_TRANSACCION>{0}</FORMATO_TRANSACCION>";
            feed += "<TRANSACCION_DESCRIPCION>{1}</TRANSACCION_DESCRIPCION>";
            feed += "<TITULAR_CLIENTE>{2}</TITULAR_CLIENTE>";
            feed += "<PUNTO_DE_ATENCION>{3}</PUNTO_DE_ATENCION>";
            feed += "<CENTRO_ATENCION_AREA>{4}</CENTRO_ATENCION_AREA>";
            feed += "<TIPO_DOC_IDENTIDAD>{5}</TIPO_DOC_IDENTIDAD>";
            feed += "<NRO_DOC_IDENTIDAD>{6}</NRO_DOC_IDENTIDAD>";
            feed += "<NRO_DOC>{7}</NRO_DOC>";
            feed += "<FECHA_TRANSACCION_PROGRAM>{8}</FECHA_TRANSACCION_PROGRAM>";
            feed += "<CASO_INTER>{9}</CASO_INTER>";
            feed += "<CASO_INTERACCION>{10}</CASO_INTERACCION>";

            feed += "<NRO_SOT>{11}</NRO_SOT>";
            feed += "<REPRES_LEGAL>{12}</REPRES_LEGAL>";
            feed += "<EMAIL>{13}</EMAIL>";
            feed += "<CORREO_CLIENTE>{14}</CORREO_CLIENTE>";
            feed += "<COSTO_TRANSACCION>{15}</COSTO_TRANSACCION>";
            feed += "<ENVIO_CORREO>{16}</ENVIO_CORREO>";
            feed += "<ENVIO_MAIL>{17}</ENVIO_MAIL>";
            feed += "<CONTRATO>{18}</CONTRATO>";
            feed += "<CONTRATO_CLIENTE>{19}</CONTRATO_CLIENTE>";
            feed += "<FECHA_TRANSACCION>{20}</FECHA_TRANSACCION>";
            feed += "<FECHA_ATENCION>{21}</FECHA_ATENCION>";
            feed += "<DIRECCION_CLIENTE_ACTUAL>{22}</DIRECCION_CLIENTE_ACTUAL>";
            feed += "<REFERENCIA_TRANSACCION_ACTUAL>{23}</REFERENCIA_TRANSACCION_ACTUAL>";
            feed += "<DISTRITO_CLIENTE_ACTUAL>{24}</DISTRITO_CLIENTE_ACTUAL>";
            feed += "<CODIGO_POSTAL_ACTUAL>{25}</CODIGO_POSTAL_ACTUAL>";
            feed += "<PAIS_CLIENTE_ACTUAL>{26}</PAIS_CLIENTE_ACTUAL>";
            feed += "<PROVINCIA_CLIENTE_ACTUAL>{27}</PROVINCIA_CLIENTE_ACTUAL>";
            feed += "<DIRECCION_CLIENTE_DESTINO>{28}</DIRECCION_CLIENTE_DESTINO>";
            feed += "<REFERENCIA_TRANSACCION_DESTINO>{29}</REFERENCIA_TRANSACCION_DESTINO>";
            feed += "<DEPARTAMENTO_CLIENTE_DESTINO>{30}</DEPARTAMENTO_CLIENTE_DESTINO>";
            feed += "<DISTRITO_CLIENTE_DESTINO>{31}</DISTRITO_CLIENTE_DESTINO>";
            feed += "<APLICA_CAMBIO_DIR_FACT>{32}</APLICA_CAMBIO_DIR_FACT>";
            feed += "<CODIGO_POSTALL_DESTINO>{33}</CODIGO_POSTALL_DESTINO>";
            feed += "<PAIS_CLIENTE_DESTINO>{34}</PAIS_CLIENTE_DESTINO>";
            feed += "<PROVINCIA_CLIENTE_DESTINO>{35}</PROVINCIA_CLIENTE_DESTINO>";
            feed += "<CODIGO_PLANO_DESTINO>{36}</CODIGO_PLANO_DESTINO>";
            feed += "<FLAG_TIPO_TRASLADO>{37}</FLAG_TIPO_TRASLADO>";
            feed += "<DEPARTAMENTO_CLIENTE_ACTUAL>{38}</DEPARTAMENTO_CLIENTE_ACTUAL>";
            feed += "<CODIGO_POSTAL>{39}</CODIGO_POSTAL>";
            feed += "<CODIGO_POSTAL_DESTINO>{40}</CODIGO_POSTAL_DESTINO>";
            feed += "<CONTENIDO_COMERCIAL2>{41}</CONTENIDO_COMERCIAL2>";

            feed = string.format(feed,
                that.TransferSession.Configuration.Constants.Constancia_FormatoTransaccion,
                (that.KeyTab) ? that.TransferSession.Configuration.Constants.Constancia_TE_TransaccionDescripcion : that.TransferSession.Configuration.Constants.Constancia_TI_TransaccionDescripcion,
                that.TransferSession.Data.CustomerInformation.CustomerName,
                (that.KeyTab == false) ? $("#ddlCenterofAttention_Internal option:selected").html() : $("#ddlCenterofAttention option:selected").html(),
                (that.KeyTab == false) ? $("#ddlCenterofAttention_Internal option:selected").html() : $("#ddlCenterofAttention option:selected").html(),
                that.TransferSession.Data.CustomerInformation.LegalRepresentativeDocument,
                that.TransferSession.Data.CustomerInformation.DocumentNumber,
                that.TransferSession.Data.CustomerInformation.DocumentNumber,
                (that.KeyTab == false) ? $('#txtCalendar_Internal').val() : $('#txtCalendar').val(),//$("#txtCalendar").val(),
                "@idInteraccion",
                "",
                "@codSolot",
                that.TransferSession.Data.CustomerInformation.LegalRepresentative,
                (that.KeyTab == false) ? $('#txtSendMail_Internal').val() : $('#txtSendMail').val(),
                (that.KeyTab == false) ? $('#txtSendMail_Internal').val() : $('#txtSendMail').val(),
                "S/. " + (that.KeyTab ? $('#txtChargeAmount').val() : $('#txtChargeAmount_Internal').val()),
                (that.KeyTab == false) ? ($('#chkSendMail_Internal').prop("checked") ? "SÍ" : "NO") : ($('#chkSendMail').prop("checked") ? "SÍ" : "NO"),
                (that.KeyTab == false) ? ($('#chkSendMail_Internal').prop("checked") ? "SÍ" : "NO") : ($('#chkSendMail').prop("checked") ? "SÍ" : "NO"),
                that.TransferSession.Data.CustomerInformation.ContractNumber,
                that.TransferSession.Data.CustomerInformation.ContractNumber,
                that.getFechaActual(),
                that.getFechaActual(),
                (that.TransferSession.Data.Instalation.Direccion == undefined) ? "" : that.TransferSession.Data.Instalation.Direccion,
                (that.TransferSession.Data.Instalation.NotaDireccion == undefined) ? "" : that.TransferSession.Data.Instalation.NotaDireccion,
                (that.TransferSession.Data.Instalation.Distrito == undefined) ? "" : that.TransferSession.Data.Instalation.Distrito,
                that.TransferSession.Data.CustomerInformation.InvoicePostal == null ? "" : that.TransferSession.Data.CustomerInformation.InvoicePostal,
                (that.TransferSession.Data.Instalation.Pais == undefined) ? "" : that.TransferSession.Data.Instalation.Pais,
                (that.TransferSession.Data.Instalation.Provincia == undefined) ? "" : that.TransferSession.Data.Instalation.Provincia,
                that.GenerarDireccionSinCode(),//that.GenerarDireccion(),
                (that.KeyTab) ? $("#spnPreReference").html() : "",
                (that.KeyTab) ? $("#ddlNoteDepartment option:selected").html() : "",
                (that.KeyTab) ? $("#ddlNoteDistrict option:selected").html() : "",
                $('#chkUseChangeBilling').prop("checked") ? "SÍ" : "NO",
                (that.KeyTab) ? $('#txtNoteCodePostal').val() : "",
                "PERU",
                (that.KeyTab) ? $("#ddlNoteProvince option:selected").html() : "",
                (that.KeyTab) ? controls.txtCodPlane.val() : "",
                (that.KeyTab) ? that.TransferSession.Configuration.Constants.Constancia_TE_FlagTipoTraslado : that.TransferSession.Configuration.Constants.Constancia_TI_FlagTipoTraslado,
                (that.TransferSession.Data.Instalation.Departamento == undefined) ? "" : that.TransferSession.Data.Instalation.Departamento,
                that.TransferSession.Data.CustomerInformation.BillingPostalCode,
                (that.KeyTab) ? $('#txtNoteCodePostal').val() : "",
                that.TransferSession.Configuration.Constants.Constancia_ContenidoComercial
                )

            return "<PLANTILLA>" + feed + "</PLANTILLA>";
        },

        getXMLTramaVenta: function () {

            var that = this,
                controls = that.getControls();

            var feed = "";

            feed += string.format("<CUSTOMER_ID>{0}</CUSTOMER_ID>", that.TransferSession.Data.CustomerInformation.CustomerID);
            feed += string.format("<COD_ID>{0}</COD_ID>", that.TransferSession.Data.CustomerInformation.ContractNumber);
            feed += string.format("<COD_INTERCASO>{0}</COD_INTERCASO>", "@idInteraccion");
            feed += string.format("<CODIGO_OCC>{0}</CODIGO_OCC>", that.TransferSession.Configuration.Constants.Trama_CodOcc == null ? "" : that.TransferSession.Configuration.Constants.Trama_CodOcc);
            feed += String.format("<MONTO_OCC>{0}</MONTO_OCC>", (that.KeyTab) ?
                                                                ($('#chkLoyalty').prop('checked') ? "0,00" : that.TransferSession.Configuration.Constants.Constantes_TE_MontoOcc)
                                                                : ($('#chkLoyalty_Internal').prop('checked') ? "0,00" : that.TransferSession.Configuration.Constants.Constantes_TI_MontoOcc));
            feed += string.format("<CODEDIF>{0}</CODEDIF>", (that.KeyTab) ? $("#txtCodBuilding").val() : "");
            feed += string.format("<CODMOTOT>{0}</CODMOTOT>", (that.KeyTab) ? that.TransferSession.Configuration.Constants.Constantes_TE_MotivoSot : that.TransferSession.Configuration.Constants.Constantes_TI_MotivoSot);
            feed += string.format("<CENTRO_POBLADO>{0}</CENTRO_POBLADO>", (that.KeyTab) ? $("#ddlNoteCenterPopulated").val() : "");
            feed += string.format("<CODPLANO>{0}</CODPLANO>", (that.KeyTab) ? $("#txtCodPlane").val() : that.TransferSession.Data.Instalation.CodPlano);
            feed += string.format("<UBIGEO>{0}</UBIGEO>", (that.KeyTab) ? that.getUbigeoSeleccionado() : (that.TransferSession.Data.Instalation.Ubigeo == undefined ? "" : that.TransferSession.Data.Instalation.Ubigeo));
            feed += string.format("<CODZONA>{0}</CODZONA>", (that.KeyTab) ? controls.ddlNoteZote.val() : "");
            feed += string.format("<FECPROG>{0}</FECPROG>", (that.KeyTab) ? $('#txtCalendar').val() : $('#txtCalendar_Internal').val());
            feed += string.format("<FRANJA_HOR>{0}</FRANJA_HOR>", (that.KeyTab) ?
                                                                   ($.string.isEmptyOrNull($("#ddlTimeZone option:selected").attr('idHorario')) ? '' : $("#ddlTimeZone option:selected").attr('idHorario'))
                                                                  : ($.string.isEmptyOrNull($("#ddlTimeZone_Internal option:selected").attr('idHorario')) ? '' : $("#ddlTimeZone_Internal option:selected").attr('idHorario')));
            debugger;
            feed += string.format("<FLAG_ACT_DIR_FACT>{0}</FLAG_ACT_DIR_FACT>", (that.KeyTab) ? ($('#chkUseChangeBilling').prop('checked') ? "SI" : "NO") : "NO");
            feed += string.format("<LOTE>{0}</LOTE>", (that.KeyTab) ? controls.txtLot.val() : '');
            feed += string.format("<MANZANA>{0}</MANZANA>", (that.KeyTab) ? controls.txtNumberBlock.val() : '');
            feed += string.format("<TIP_URB>{0}</TIP_URB>", (that.KeyTab) ? controls.ddlNoteUrbanization.val() : '');
            feed += string.format("<NOMURB>{0}</NOMURB>", (that.KeyTab) ? controls.txtNoteUrbanization.val() : '');
            feed += string.format("<TIPO_VIA>{0}</TIPO_VIA>", (that.KeyTab) ? controls.ddlStreet.val() : '');
            feed += string.format("<NUM_VIA>{0}</NUM_VIA>", (that.KeyTab) ? controls.txtNumber.val() : '');
            feed += string.format("<NOM_VIA>{0}</NOM_VIA>", (that.KeyTab) ? controls.txtNameStreet.val() : '')
            feed += string.format("<OBSERVACION>{0}</OBSERVACION>", (that.KeyTab) ?
                                                                    ($.string.isEmptyOrNull($('#txtNote').val()) ? '' : $('#txtNote').val().replace(/\n/g, "\\n"))
                                                                    : ($.string.isEmptyOrNull($('#txtNote_Internal').val()) ? '' : $('#txtNote_Internal').val().replace(/\n/g, "\\n")));
            //if(Session.SessionParams.DATACUSTOMER.objPostDataAccount.plataformaAT === 'TOBE'){
            //	feed += string.format("<REFERENCIA>{0}</REFERENCIA>", (that.KeyTab) ? controls.txtNoteReference.val() : '');
            //}
            //else{
            feed += string.format("<REFERENCIA>{0}</REFERENCIA>", (that.KeyTab) ?
                                                                (controls.ddlDepartInter.val() != '' ? String.format("{0} {1} {2}", $("#ddlDepartInter option:selected").text(), controls.txtNumberDepartInter.val(), controls.txtNoteReference.val()) : controls.txtNoteReference.val())
                                                                : '');
            //}

            debugger;
            feed += string.format("<TIPO_TRANS>{0}</TIPO_TRANS>", (that.KeyTab) ?
                                                                    that.TransferSession.Configuration.Constants.Trama_TE_TipoTrans
                                                                    : that.TransferSession.Configuration.Constants.Trama_TI_TipoTrans);
            feed += string.format("<TIPOSERVICIO>{0}</TIPOSERVICIO>", that.TransferSession.Configuration.Constants.Trama_TipoServicio);//that.TransferSession.Configuration.Constants.Trama_TipoServicio,//PILOTO QUITAR PARA PASE
            feed += string.format("<ID_CONSULTA_ETA>{0}</ID_CONSULTA_ETA>", (that.KeyTab) ?
                                                                    ($.string.isEmptyOrNull($("#ddlTimeZone option:selected").attr('idConsulta')) ? '' : $("#ddlTimeZone option:selected").attr('idConsulta'))
                                                                    : ($.string.isEmptyOrNull($("#ddlTimeZone_Internal option:selected").attr('idConsulta')) ? '' : $("#ddlTimeZone_Internal option:selected").attr('idConsulta')));
            feed += string.format("<ID_BUCKET>{0}</ID_BUCKET>", (that.KeyTab) ?
                                                                ($.string.isEmptyOrNull($("#ddlTimeZone option:selected").attr('idBucket')) ? '' : $("#ddlTimeZone option:selected").attr('idBucket'))
                                                                : ($.string.isEmptyOrNull($("#ddlTimeZone_Internal option:selected").attr('idBucket')) ? '' : $("#ddlTimeZone_Internal option:selected").attr('idBucket')));
            feed += string.format("<PAIS>{0}</PAIS>", "PERU");
            feed += string.format("<DEPARTAMENTO>{0}</DEPARTAMENTO>", (that.KeyTab) ? $("#ddlNoteDepartment option:selected").html() : "");
            feed += string.format("<PROVINCIA>{0}</PROVINCIA>", (that.KeyTab) ? $("#ddlNoteProvince option:selected").html() : "");
            feed += string.format("<DISTRITO>{0}</DISTRITO>", (that.KeyTab) ? $("#ddlNoteDistrict option:selected").html() : "");
            feed += string.format("<APLICACION>{0}</APLICACION>", that.TransferSession.Configuration.Constants.Constantes_UsrAplicacion);
            feed += string.format("<TIPO_PRODUCTO>{0}</TIPO_PRODUCTO>", that.TransferSession.Configuration.Constants.Producto);
            feed += string.format("<TIPTRA>{0}</TIPTRA>", (that.KeyTab) ? that.TransferSession.Configuration.Constants.Constantes_TE_Tipotrabajo : that.TransferSession.Configuration.Constants.Constantes_TI_Tipotrabajo);
            feed += string.format("<CODPLAN>{0}</CODPLAN>", that.TransferSession.Data.planCode);
            feed += string.format("<FLAG_FIDELIZA>{0}</FLAG_FIDELIZA>", (that.KeyTab) ?
                                                            ($('#chkLoyalty').prop('checked') ? "1" : "0")
                                                            : ($('#chkLoyalty_Internal').prop('checked') ? "1" : "0"));
            feed += string.format("<DIRECCION_FACTURACION>{0}</DIRECCION_FACTURACION>", (that.KeyTab) ? that.GenerarDireccionSinCode() : '');
            feed += string.format("<NOTAS_DIRECCION>{0}</NOTAS_DIRECCION>", (that.KeyTab) ? $("#spnPreReference").html() : '');
            feed += string.format("<SUBTIPO_ORDEN>{0}</SUBTIPO_ORDEN>", (that.KeyTab) ?
                                                                    ($.string.isEmptyOrNull($("#ddlSubWorkType option:selected").attr('CodTipoSubOrden')) ? '' : $("#ddlSubWorkType option:selected").attr('CodTipoSubOrden'))
                                                                    : ($.string.isEmptyOrNull($("#ddlSubWorkType_Internal option:selected").attr('CodTipoSubOrden')) ? '' : $("#ddlSubWorkType_Internal option:selected").attr('CodTipoSubOrden')));
            feed += string.format("<CODIGO_POSTAL>{0}</CODIGO_POSTAL>", (that.KeyTab) ? $('#txtNoteCodePostal').val() : "");
            feed += string.format("<FRANJA>{0}</FRANJA>", (that.KeyTab) ?
                                                                    ($.string.isEmptyOrNull($("#ddlTimeZone option:selected").attr('Franja')) ? '' : $("#ddlTimeZone option:selected").attr('Franja'))
                                                                    : ($.string.isEmptyOrNull($("#ddlTimeZone_Internal option:selected").attr('Franja')) ? '' : $("#ddlTimeZone_Internal option:selected").attr('Franja')));
            feed += string.format("<USUREG>{0}</USUREG>", Session.SessionParams.USERACCESS.login);
            feed += string.format("<NODOPOSTVENTA>{0}</NODOPOSTVENTA>", 'Nodo ' + $("#spnNode").text());
            feed += string.format("<TELREFERENCIA>{0}</TELREFERENCIA>", (that.KeyTab == false) ? $('#txtReferencePhone_Internal').val() : $('#txtReferencePhone').val());
            feed += string.format("<PLATF_FACTURADOR>{0}</PLATF_FACTURADOR>", that.TransferSession.Configuration.Constants.Plataforma_Facturador);
            debugger;
            return "<BODY>" + feed + "</BODY>";

        },

        ///####################################Transversal####################################///
        GuardarDatos: function () {
            var that = this,
                controls = that.getControls();

            var Servicios = [
                {
                    "servicio": "Cliente",
                    "parametros": [
                        {
                            "parametro": "phone",
                            "valor": that.TransferSession.Configuration.Constants.Tipificacion_KeyCustomerInteract + that.TransferSession.Data.CustomerInformation.CustomerID
                        },
                        {
                            "parametro": "usuario",
                            "valor": Session.SessionParams.USERACCESS.login
                        },
                        {
                            "parametro": "nombres",
                            "valor": that.TransferSession.Data.CustomerInformation.CustomerName
                        },
                        {
                            "parametro": "apellidos",
                            "valor": that.TransferSession.Data.CustomerInformation.CustomerName
                        },
                        {
                            "parametro": "razonsocial",
                            "valor": that.TransferSession.Data.CustomerInformation.LegalRepresentative
                        },
                        {
                            "parametro": "tipoDoc",
                            "valor": that.TransferSession.Data.CustomerInformation.LegalRepresentativeDocument
                        },
                        {
                            "parametro": "numDoc",
                            "valor": that.TransferSession.Data.CustomerInformation.DocumentNumber
                        },
                        {
                            "parametro": "domicilio",
                            "valor": (that.TransferSession.Data.Instalation.Direccion == undefined) ? "" : that.TransferSession.Data.Instalation.Direccion
                        },
                        {
                            "parametro": "distrito",
                            "valor": that.TransferSession.Data.CustomerInformation.BillingDistrict
                        },
                        {
                            "parametro": "departamento",
                            "valor": that.TransferSession.Data.CustomerInformation.BillingDepartment
                        },
                        {
                            "parametro": "provincia",
                            "valor": that.TransferSession.Data.CustomerInformation.BillingProvince
                        },
                        {
                            "parametro": "modalidad",
                            "valor": that.TransferSession.Configuration.Constants.Tipificacion_Modalidad
                        }
                    ]
                },
                {
                    "servicio": "Tipificacion",
                    "parametros": [
                        {
                            "parametro": "coid",
                            "valor": that.TransferSession.Data.CustomerInformation.ContractNumber,
                        },
                        {
                            "parametro": "customer_id",
                            "valor": that.TransferSession.Data.CustomerInformation.CustomerID,
                        },
                        {
                            "parametro": "Phone",
                            "valor": that.TransferSession.Configuration.Constants.Tipificacion_KeyCustomerInteract + that.TransferSession.Data.CustomerInformation.CustomerID
                        },
                        {
                            "parametro": "flagReg",
                            "valor": that.TransferSession.Configuration.Constants.Tipificacion_FlagReg
                        },
                        {
                            "parametro": "contingenciaClarify",
                            "valor": that.TransferSession.Configuration.Constants.Tipificacion_ContingenciaClarify
                        },
                        {
                            "parametro": "tipo",
                            "valor": (that.KeyTab) ? that.TransferSession.Data.Tipificacion_TE.Tipo : that.TransferSession.Data.Tipificacion_TI.Tipo
                        },
                        {
                            "parametro": "clase",
                            "valor": (that.KeyTab) ? that.TransferSession.Data.Tipificacion_TE.Clase : that.TransferSession.Data.Tipificacion_TI.Clase
                        },
                        {
                            "parametro": "SubClase",
                            "valor": (that.KeyTab) ? that.TransferSession.Data.Tipificacion_TE.SubClase : that.TransferSession.Data.Tipificacion_TI.SubClase
                        },
                        {
                            "parametro": "metodoContacto",
                            "valor": that.TransferSession.Configuration.Constants.Tipificacion_MetodoContacto
                        },
                        {
                            "parametro": "tipoTipificacion",
                            "valor": that.TransferSession.Configuration.Constants.Tipificacion_TipoTipificacion
                        },
                        {
                            "parametro": "agente",
                            "valor": Session.SessionParams.USERACCESS.login
                        },
                        {
                            "parametro": "usrProceso",
                            "valor": that.TransferSession.Configuration.Constants.Constantes_UsrAplicacion
                        },
                        {
                            "parametro": "hechoEnUno",
                            "valor": that.TransferSession.Configuration.Constants.Tipificacion_HechoDeUno
                        },
                        {
                            "parametro": "Notas",
                            "valor": (that.KeyTab) ? ($.string.isEmptyOrNull($('#txtNote').val()) ? '-' : $('#txtNote').val().replace(/\t/g, " ").replace(/\n/g, "\\n")) : ($.string.isEmptyOrNull($('#txtNote_Internal').val()) ? '-' : $('#txtNote_Internal').val().replace(/\t/g, " ").replace(/\n/g, "\\n"))
                        },
                        {
                            "parametro": "flagCaso",
                            "valor": that.TransferSession.Configuration.Constants.Tipificacion_FlagCaso
                        },
                        {
                            "parametro": "resultado",
                            "valor": that.TransferSession.Configuration.Constants.Tipificacion_Resultado
                        },
                        {
                            "parametro": "servaFect",
                            "valor": ""
                        },
                        {
                            "parametro": "Inconven",
                            "valor": ""
                        },
                        {
                            "parametro": "servaFectCode",
                            "valor": ""
                        },
						{
						    "parametro": "codPlano",
						    "valor": ""
						},
						{
						    "parametro": "valor1",
						    "valor": ""
						},
                        {
                            "parametro": "valor2",
                            "valor": ""
                        },
                        {
                            "parametro": "inconvenCode",
                            "valor": ""
                        },
                        {
                            "parametro": "tipoInter",
                            "valor": that.TransferSession.Configuration.Constants.Tipificacion_TipoInter
                        }
                    ]
                },
                {
                    "servicio": "Plantilla",
                    "parametros": [
                        {
                            "parametro": "nroIteraccion",
                            "valor": ""
                        },
                        {
                            "parametro": "xinter1",
                            "valor": "PERU"
                        },
                        {
                            "parametro": "inter2",
                            "valor": ""
                        },
                        {
                            "parametro": "xinter3",
                            "valor": (that.TransferSession.Data.Instalation.Departamento == undefined) ? "" : that.TransferSession.Data.Instalation.Departamento
                        },
                        {
                            "parametro": "inter4",
                            "valor": (that.TransferSession.Data.Instalation.NotaDireccion == undefined) ? "" : that.TransferSession.Data.Instalation.NotaDireccion
                        },
                        {
                            "parametro": "inter5",
                            "valor": (that.TransferSession.Data.Instalation.Provincia == undefined) ? "" : that.TransferSession.Data.Instalation.Provincia
                        },
                        {
                            "parametro": "inter6",
                            "valor": (that.TransferSession.Data.Instalation.Distrito == undefined) ? "" : that.TransferSession.Data.Instalation.Distrito
                        },
                        {
                            "parametro": "inter7",
                            "valor": (that.TransferSession.Data.Instalation.CodPlano == undefined) ? "" : that.TransferSession.Data.Instalation.CodPlano
                        },
                        {
                            "parametro": "inter8",
                            "valor": ""
                        },
						{
						    "parametro": "inter9",
						    "valor": ""
						},
						{
						    "parametro": "inter10",
						    "valor": ""
						},
						{
						    "parametro": "inter11",
						    "valor": ""
						},
                        {
                            "parametro": "inter12",
                            "valor": ""
                        },
						{
						    "parametro": "inter13",
						    "valor": ""
						},
						{
						    "parametro": "inter14",
						    "valor": ""
						},
                        {
                            "parametro": "inter15",
                            "valor": (that.KeyTab == false) ? $("#ddlCenterofAttention_Internal option:selected").html() : $("#ddlCenterofAttention option:selected").html()
                        },
                        {
                            "parametro": "inter16",
                            "valor": (that.KeyTab) ? $("#txtSendMail").val() : $("#txtSendMail_Internal").val()
                        },
                        {
                            "parametro": "inter17",
                            "valor": (that.KeyTab) ? that.TransferSession.Data.Instalation.NotaDireccion : ""
                        },
                        {
                            "parametro": "inter18",
                            "valor": (that.KeyTab) ? controls.txtNoteCodePostal.val() : ""
                        },
                        {
                            "parametro": "inter19",
                            "valor": "PERU"
                        },
                        {
                            "parametro": "inter20",
                            "valor": (that.KeyTab) ? $("#txtCodBuilding").val() : ""
                        },
                        {
                            "parametro": "inter21",
                            "valor": (that.KeyTab) ? $("#ddlNoteCenterPopulated option:selected").html() : ""
                        },
                        {
                            "parametro": "inter30",
                            "valor": (that.KeyTab) ? ($.string.isEmptyOrNull($('#txtNote').val()) ? '-' : $('#txtNote').val().replace(/\t/g, " ").replace(/\n/g, "\\n")) : ($.string.isEmptyOrNull($('#txtNote_Internal').val()) ? '-' : $('#txtNote_Internal').val().replace(/\t/g, " ").replace(/\n/g, "\\n"))
                        },
                        {
                            "parametro": "P_PLUS_INTER2INTERACT",
                            "valor": ""
                        },
                        {
                            "parametro": "P_ADJUSTMENT_AMOUNT",
                            "valor": ""
                        },
                        {
                            "parametro": "P_ADJUSTMENT_REASON",
                            "valor": ""
                        },
                        {
                            "parametro": "P_ADDRESS",
                            "valor": that.GenerarDireccionSinCode()//that.GenerarDireccion()
                        },
                        {
                            "parametro": "P_OLD_CLAROLOCAL1",
                            "valor": $('#chkUseChangeBilling').prop("checked") ? "1" : "0",
                        },
                        {
                            "parametro": "P_CLAROLOCAL3",
                            "valor": $('#chkLoyalty').prop('checked') ? "S\\u00cd" : "NO"
                        },
                        {
                            "parametro": "P_CLAROLOCAL4",
                            "valor": $("#txtChargeAmount").val(),
                        },
                        {
                            "parametro": "P_CLAROLOCAL5",
                            "valor": $('#chkSendMail').prop('checked') ? "S\\u00cd" : "NO"
                        },
                        {
                            "parametro": "P_CLAROLOCAL6",
                            "valor": $('#chkSendMail').prop('checked') ? $("#txtSendMail").val() : ""
                        },
                        {
                            "parametro": "P_CONTACT_PHONE",
                            "valor": ""
                        },
                        {
                            "parametro": "P_DNI_LEGAL_REP",
                            "valor": ""
                        },
						{
						    "parametro": "P_DOCUMENT_NUMBER",
						    "valor": ""
						},
                        {
                            "parametro": "P_EMAIL",
                            "valor": (that.KeyTab) ? $("#txtSendMail").val() : $("#txtSendMail_Internal").val()
                        },
                        {
                            "parametro": "P_FIRST_NAME",
                            "valor": ""
                        },
                        {
                            "parametro": "P_FIXED_NUMBER",
                            "valor": (that.KeyTab) ? controls.txtCodPlane.val() : ""
                        },
						{
						    "parametro": "P_LAST_NAME",
						    "valor": ""
						},
                        {
                            "parametro": "P_LASTNAME_REP",
                            "valor": that.getUbigeoSeleccionado()
                        },
                        {
                            "parametro": "P_REASON",
                            "valor": that.getFechaActual()
                        },
                        {
                            "parametro": "P_MODEL",
                            "valor": (that.KeyTab) ? $('#txtCalendar').val() : $('#txtCalendar_Internal').val()
                        },
                        {
                            "parametro": "P_LOT_CODE",
                            "valor": (that.KeyTab) ? "Traslado Externo" : "Traslado Interno"
                        },
                        {
                            "parametro": "P_FLAG_REGISTERED",
                            "valor": $('#chkSendMail').prop('checked') ? "1" : "0"
                        },
                        {
                            "parametro": "P_REGISTRATION_REASON",
                            "valor": that.TransferSession.Data.CustomerInformation.CustomerName
                        },
                        {
                            "parametro": "P_CLARO_NUMBER",
                            "valor": that.TransferSession.Data.CustomerInformation.CustomerID
                        },
                        {
                            "parametro": "P_MONTH",
                            "valor": (that.TransferSession.Data.Instalation.Direccion == undefined) ? "" : that.TransferSession.Data.Instalation.Direccion
                        },
                        {
                            "parametro": "P_BASKET",
                            "valor": Session.SessionParams.DATACUSTOMER.BusinessName
                        },
                        {
                            "parametro": "P_EXPIRE_DATE",
                            "valor": ""
                        },
						{
						    "parametro": "P_ADDRESS5",
						    "valor": ""
						},
						{
						    "parametro": "P_CHARGE_AMOUNT",
						    "valor": ""
						},
                        {
                            "parametro": "P_CITY",
                            "valor": $("#ddlNoteProvince option:selected").html()
                        },
                        {
                            "parametro": "P_CONTACT_SEX",
                            "valor": ""
                        },
                        {
                            "parametro": "P_DEPARTMENT",
                            "valor": $("#ddlNoteDepartment option:selected").html()
                        },
                        {
                            "parametro": "P_DISTRICT",
                            "valor": $("#ddlNoteDistrict option:selected").html()
                        },
                        {
                            "parametro": "P_EMAIL_CONFIRMATION",
                            "valor": ""
                        },
						{
						    "parametro": "P_FAX",
						    "valor": ""
						},
                        {
                            "parametro": "P_FLAG_CHARGE",
                            "valor": that.TransferSession.Data.Instalation.CodPlano
                        },
                        {
                            "parametro": "P_REFERENCE_ADDRESS",
                            "valor": controls.txtNoteReference.val()//that.GenerarNotasDireccion()
                        },
                        {
                            "parametro": "P_TYPE_DOCUMENT",
                            "valor": that.TransferSession.Configuration.Constants.Constantes_TipoCustomer
                        },
                        {
                            "parametro": "P_ZIPCODE",
                            "valor": $('#txtNoteCodePostal').val()
                        },
                        {
                            "parametro": "P_ICCID",
                            "valor": that.TransferSession.Data.CustomerInformation.CustomerID
                        },
                        {
                            "parametro": "P_NAME_LEGAL_REP",
                            "valor": that.TransferSession.Data.CustomerInformation.LegalRepresentative
                        },
                        {
                            "parametro": "P_OLD_CLARO_LDN1",
                            "valor": ""
                        }
                    ]
                },
                {
                    "servicio": "Tramas", /*(Generacion de SOT)*/
                    "parametros": [
                        {
                            "parametro": "Trama_Ventas",
                            "valor": that.getXMLTramaVenta()
                        },
                        {
                            "parametro": "Trama_Servicios",
                            "valor": ""
                        }
                    ]
                },
                {
                    "servicio": "Constancia",
                    "parametros": [
                        {
                            "parametro": "DRIVE_CONSTANCIA",
                            "valor": that.getXMLTramaConstancia()
                        }
                    ]
                },
                {
                    "servicio": "Direccion",
                    "parametros": [
                        {
                            "parametro": "DIRECCION_CLIENTE_DESTINO",
                            "valor": (that.KeyTab) ? that.GenerarDireccion() : ""
                        },
                        {
                            "parametro": "REFERENCIA_TRANSACCION_DESTINO",
                            "valor": (that.KeyTab) ? $("#spnPreReference").html() : ""
                        },
                        {
                            "parametro": "DISTRITO_CLIENTE_DESTINO",
                            "valor": (that.KeyTab) ? $("#ddlNoteDistrict option:selected").html() : ""
                        },
                        {
                            "parametro": "PROVINCIA_CLIENTE_DESTINO",
                            "valor": (that.KeyTab) ? $("#ddlNoteProvince option:selected").html() : ""
                        },
                        {
                            "parametro": "CODIGO_POSTAL_DESTINO",
                            "valor": (that.KeyTab) ? controls.txtNoteCodePostal.val() : ""
                        },
                        {
                            "parametro": "DEPARTAMENTO_CLIENTE_DESTINO",
                            "valor": (that.KeyTab) ? $("#ddlNoteDepartment option:selected").html() : ""
                        },
                        {
                            "parametro": "PAIS_CLIENTE_DESTINO",
                            "valor": "PERU"
                        }
                    ]
                },
		        {
		            "servicio": "Correo",
		            "parametros": [
				        {
				            "parametro": "remitente",
				            "valor": that.TransferSession.Configuration.Constants.Correo_remitente
				        },
				        {
				            "parametro": "destinatario",
				            "valor": (that.KeyTab) ? $('#txtSendMail').val() : $('#txtSendMail_Internal').val()
				        },
				        {
				            "parametro": "asunto",
				            "valor": (that.KeyTab) ? that.TransferSession.Configuration.Constants.Correo_TE_asunto : that.TransferSession.Configuration.Constants.Correo_TI_asunto
				        },
				        {
				            "parametro": "htmlFlag",
				            "valor": that.TransferSession.Configuration.Constants.Correo_htmlFlag
				        },
				        {
				            "parametro": "driver/fileName",
				            "valor": that.TransferSession.Configuration.Constants.Correo_driver
				        },
				        {
				            "parametro": "formatoConstancia",
				            "valor": that.TransferSession.Configuration.Constants.Correo_formatoConstancia
				        },
				        {
				            "parametro": "p_fecha",
				            "valor": "dd_MM_yyyy"
				        },
				        {
				            "parametro": "directory",
				            "valor": that.TransferSession.Configuration.Constants.Correo_directory
				        },
				        {
				            "parametro": "fileName",
				            "valor": "@idInteraccion_@p_fecha_" + ((that.KeyTab) ? that.TransferSession.Configuration.Constants.Correo_TE_fileName : that.TransferSession.Configuration.Constants.Correo_TI_fileName) + "@extension"
				        },
				        {
				            "parametro": "mensaje",
				            "valor": (that.KeyTab) ? that.TransferSession.Configuration.Constants.Correo_TE_mensaje : that.TransferSession.Configuration.Constants.Correo_TI_mensaje
				        },
		            ]
		        },
		        {
		            "servicio": "Auditoria",
		            "parametros": [
				        {
				            "parametro": "ipcliente",
				            "valor": that.TransferSession.Data.AuditRequest.idApplication// "172.19.91.216" //System.Web.HttpContext.Current.Request.UserHostAddress;
				        },
				        {
				            "parametro": "nombrecliente",
				            "valor": that.TransferSession.Data.CustomerInformation.CustomerName
				        },
				        {
				            "parametro": "ipservidor",
				            "valor": that.TransferSession.Data.AuditRequest.IPAddress// "172.19.91.216" //audit.ipAddress,
				        },
				        {
				            "parametro": "nombreservidor",
				            "valor": that.TransferSession.Data.AuditRequest.ApplicationName//"SIAC_UNICO" //audit.applicationName
				        },
				        {
				            "parametro": "cuentausuario",
				            "valor": Session.SessionParams.USERACCESS.login
				        },
				        {
				            "parametro": "monto",
				            "valor": that.TransferSession.Configuration.Constants.Constantes_Monto
				        },
				        {
				            "parametro": "texto",
				            "valor": string.format("/Ip Cliente: {0}/Usuario:  {1}/Opcion: {2}/Fecha y Hora: {3} {4}", that.TransferSession.Data.AuditRequest.idApplication, Session.SessionParams.USERACCESS.login, "Traslado Externo", that.getFechaActual(), that.getHoraActual())//"15/10/2020 19:03:21")
				        },
                        {
                            "parametro": "telefono",
                            "valor": that.TransferSession.Data.CustomerInformation.CustomerID
                        },
                        {
                            "parametro": "TRANSACCION_DESCRIPCION",
                            "valor": (that.KeyTab) ? that.TransferSession.Data.Tipificacion_TE.SubClase : that.TransferSession.Data.Tipificacion_TI.SubClase
                        },
                        {
                            "parametro": "idTransaccion",
                            "valor": that.TransferSession.Data.AuditRequest.Transaction
                        }
		            ]
		        },
				{
				    "servicio": "Trazabilidad",
				    "parametros": [
						{
						    "parametro": "tipoTransaccion",
						    "valor": that.TransferSession.Configuration.Constants.Constancia_FormatoTransaccion
						},
						{
						    "parametro": "tarea",
						    "valor": "generaConstancia"
						},
						{
						    "parametro": "fechaRegistro",
						    "valor": that.getFechaActual()
						},
						{
						    "parametro": "descripcion",
						    "valor": "Trazabilidad generada desde SIACUNICO"
						}
				    ]
				}
            ];

            var objLoadParameters = {};

            objLoadParameters.idFlujo = '';

            var Services = [];

            if (!that.KeyTab) {
                objLoadParameters.idFlujo = 'TI';

                Services = Servicios.filter(function (n) {
                    if (n.servicio !== "Direccion" && n.servicio !== "Plantilla")
                        return true
                });

                var plaInter = {
                    "servicio": "Plantilla",
                    "parametros": [
                        {
                            "parametro": "nroIteraccion",
                            "valor": ""
                        },
                        {
                            "parametro": "xinter1",
                            "valor": "PERU"
                        },
                        {
                            "parametro": "inter2",
                            "valor": ""
                        },
                        {
                            "parametro": "xinter3",
                            "valor": (that.TransferSession.Data.Instalation.Departamento == undefined) ? "" : that.TransferSession.Data.Instalation.Departamento
                        },
                        {
                            "parametro": "inter4",
                            "valor": (that.TransferSession.Data.Instalation.NotaDireccion == undefined) ? "" : that.TransferSession.Data.Instalation.NotaDireccion
                        },
                        {
                            "parametro": "inter5",
                            "valor": (that.TransferSession.Data.Instalation.Provincia == undefined) ? "" : that.TransferSession.Data.Instalation.Provincia
                        },
                        {
                            "parametro": "inter6",
                            "valor": (that.TransferSession.Data.Instalation.Distrito == undefined) ? "" : that.TransferSession.Data.Instalation.Distrito
                        },
                        {
                            "parametro": "inter7",
                            "valor": (that.TransferSession.Data.Instalation.CodPlano == undefined) ? "" : that.TransferSession.Data.Instalation.CodPlano
                        },
                        {
                            "parametro": "inter8",
                            "valor": ""
                        },
						{
						    "parametro": "inter9",
						    "valor": ""
						},
						{
						    "parametro": "inter10",
						    "valor": ""
						},
						{
						    "parametro": "inter11",
						    "valor": ""
						},
                        {
                            "parametro": "inter12",
                            "valor": ""
                        },
						{
						    "parametro": "inter13",
						    "valor": ""
						},
						{
						    "parametro": "inter14",
						    "valor": ""
						},
                        {
                            "parametro": "inter15",
                            "valor": (that.KeyTab) ? $("#ddlCenterofAttention option:selected").html() : $("#ddlCenterofAttention_Internal option:selected").html()
                        },
                        {
                            "parametro": "inter16",
                            "valor": (that.KeyTab) ? $("#txtSendMail").val() : $("#txtSendMail_Internal").val()
                        },
                        {
                            "parametro": "inter17",
                            "valor": (that.KeyTab) ? that.TransferSession.Data.Instalation.NotaDireccion : ""
                        },
                        {
                            "parametro": "inter18",
                            "valor": that.TransferSession.Data.CustomerInformation.BillingPostalCode//(that.KeyTab) ? controls.txtNoteCodePostal.val() : ""
                        },
                        {
                            "parametro": "inter30",
                            "valor": (that.KeyTab) ? ($.string.isEmptyOrNull($('#txtNote').val()) ? '-' : $('#txtNote').val().replace(/\t/g, " ").replace(/\n/g, "\\n")) : ($.string.isEmptyOrNull($('#txtNote_Internal').val()) ? '-' : $('#txtNote_Internal').val().replace(/\t/g, " ").replace(/\n/g, "\\n"))
                        },
                        {
                            "parametro": "P_PLUS_INTER2INTERACT",
                            "valor": ""
                        },
                        {
                            "parametro": "P_ADJUSTMENT_AMOUNT",
                            "valor": ""
                        },
                        {
                            "parametro": "P_ADJUSTMENT_REASON",
                            "valor": ""
                        },
                        {
                            "parametro": "P_OLD_CLAROLOCAL1",
                            "valor": '0'
                        },
                        {
                            "parametro": "P_CLAROLOCAL3",
                            "valor": $('#chkLoyalty_Internal').prop('checked') ? "S\\u00cd" : "NO"
                        },
                        {
                            "parametro": "P_CLAROLOCAL4",
                            "valor": $("#txtChargeAmount").val(),
                        },
                        {
                            "parametro": "P_CLAROLOCAL5",
                            "valor": $('#chkSendMail').prop('checked') ? "S\\u00cd" : "NO"
                        },
                        {
                            "parametro": "P_CLAROLOCAL6",
                            "valor": $('#chkSendMail').prop('checked') ? $("#txtSendMail").val() : ""
                        },
                        {
                            "parametro": "P_CONTACT_PHONE",
                            "valor": ""
                        },
                        {
                            "parametro": "P_DNI_LEGAL_REP",
                            "valor": ""
                        },
						{
						    "parametro": "P_DOCUMENT_NUMBER",
						    "valor": ""
						},
                        {
                            "parametro": "P_EMAIL",
                            "valor": (that.KeyTab) ? $("#txtSendMail").val() : $("#txtSendMail_Internal").val()
                        },
                        {
                            "parametro": "P_FIRST_NAME",
                            "valor": ""
                        },
						{
						    "parametro": "P_LAST_NAME",
						    "valor": ""
						},
                        {
                            "parametro": "P_REASON",
                            "valor": that.getFechaActual()
                        },
                        {
                            "parametro": "P_MODEL",
                            "valor": (that.KeyTab == false) ? $('#txtCalendar_Internal').val() : $('#txtCalendar').val()
                        },
                        {
                            "parametro": "P_LOT_CODE",
                            "valor": (that.KeyTab) ? "Traslado Externo" : "Traslado Interno"
                        },
                        {
                            "parametro": "P_REGISTRATION_REASON",
                            "valor": that.TransferSession.Data.CustomerInformation.CustomerName
                        },
                        {
                            "parametro": "P_CLARO_NUMBER",
                            "valor": that.TransferSession.Data.CustomerInformation.CustomerID
                        },
                        {
                            "parametro": "P_MONTH",
                            "valor": (that.TransferSession.Data.Instalation.Direccion == undefined) ? "" : that.TransferSession.Data.Instalation.Direccion
                        },
                        {
                            "parametro": "P_BASKET",
                            "valor": Session.SessionParams.DATACUSTOMER.BusinessName
                        },
                        {
                            "parametro": "P_EXPIRE_DATE",
                            "valor": ""
                        },
						{
						    "parametro": "P_ADDRESS5",
						    "valor": ""
						},
						{
						    "parametro": "P_CHARGE_AMOUNT",
						    "valor": ""
						},
                        {
                            "parametro": "P_CONTACT_SEX",
                            "valor": ""
                        },
                        {
                            "parametro": "P_EMAIL_CONFIRMATION",
                            "valor": ""
                        },
						{
						    "parametro": "P_FAX",
						    "valor": ""
						},
                        {
                            "parametro": "P_FLAG_CHARGE",
                            "valor": that.TransferSession.Data.Instalation.CodPlano
                        },
                        {
                            "parametro": "P_ICCID",
                            "valor": that.TransferSession.Data.CustomerInformation.CustomerID
                        },
						{
						    "parametro": "P_NAME_LEGAL_REP",
						    "valor": that.TransferSession.Data.CustomerInformation.LegalRepresentative
						}
                    ]
                };
                Services.push(plaInter);
                objLoadParameters.servicios = Services;

            } else {
                objLoadParameters.idFlujo = 'TE';
                objLoadParameters.servicios = Servicios;
            }
            objLoadParameters.TransactionID = that.TransferSession.Data.idTransactionFront;

            debugger;
            var urlBase = '/Transfer/Home/postGeneraTransaccion';
            $.app.ajax({
                type: 'POST',
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(objLoadParameters),
                url: urlBase,
                success: function (response) {

                    if (response.data != null) {

                        if (response.data != null && response.data.MessageResponse != null) {
                            if ((response.data.MessageResponse.Body.numeroSOT === "") || (response.data.MessageResponse.Body.numeroSOT === null)) {
                                alert('No se pudo ejecutar la transacción. Informe o vuelva a intentar')
                            }
                            else {
                                var nroSot = response.data.MessageResponse.Body.numeroSOT;

                                alert('La transacción se ha grabado satisfactoriamente.<br/>- Nro. SOT: ' + nroSot);
                                controls.btnConstancy.show();
                                controls.btnPrevStep.hide();
                                (that.KeyTab) ? controls.btnSave.hide() : $('#save-internal').hide();
                                controls.divFooterInfoSot.show();
                                controls.divFooterInfoSot.prepend('Nro. SOT: ' + nroSot + ' </p>');
                                $("#divExternalTransfer button").attr('disabled', true);
                            }
                        }
                        else {
                            alert('No se pudo ejecutar la transacción. Informe o vuelva a intentar')
                        }
                    }
                    else {
                        alert('No se pudo ejecutar la transacción. Informe o vuelva a intentar')
                    }
                    $.unblockUI();
                },
                error: function (ex) {
                    alert('No se pudo ejecutar la transacción. Informe o vuelva a intentar.')
                    $.unblockUI();
                }
            });
        },

        Constancy_click: function () {
            var params = ['height=600',
                'width=750',
                'resizable=yes',
                'location=yes'
            ].join(',');

            var strIdSession = Session.UrlParams.IdSession;
            window.open('/Transfer/Home/ShowRecordSharedFile' + "?&strIdSession=" + strIdSession, "_blank", params);
        },

        validateControl: function (objeto) {
            var that = this;
            if ($('#' + objeto).val() == '' || $('#' + objeto).val() == null) {
                $('#ErrorMessage' + objeto).closest('.form-control').addClass('has-error');
            }
            else {
                $('#ErrorMessage' + objeto).closest('.form-control').removeClass('has-error');
                $('#ErrorMessage' + objeto).text('');
            }
        },


    }

    $.fn.Transfer = function () {
        var option = arguments[0],
            args = arguments,
            value,
            allowedMethods = [];

        this.each(function () {
            var $this = $(this),
                data = $this.data('Transfer'),
                options = $.extend({}, $.fn.Transfer.defaults,
                    $this.data(), typeof option === 'object' && option);

            if (!data) {
                data = new Form($this, options);
                $this.data('Transfer', data);
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

    $.fn.Transfer.defaults = {
    }

    $('#divIndex').Transfer();

})(jQuery, null);