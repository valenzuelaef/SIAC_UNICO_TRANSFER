using System.Web.Optimization;

namespace Claro.SIACU.App.Transfer.Areas.Transfer.Utils
{
    public static class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new StyleBundle("~/Content/Transfer/bootstrap-css").Include(
             "~/Content/css/fonts.css",
             "~/Content/css/bootstrap.css",
             "~/Content/css/bootstrap-theme.css",
             "~/Content/css/bootstrap-multiselect-v2.css",
             "~/Content/css/bootstrap-select.css",
             "~/Content/css/dataTables.bootstrap.min.css",
             "~/Content/css/jquery.dataTables.select.css",
             "~/Content/css/datepicker.css"));

            bundles.Add(new StyleBundle("~/bundles/Transfer/claro-fw-css").Include(
                "~/Content/css/claro-fw.css"));

            bundles.Add(new ScriptBundle("~/bundles/Transfer/jquery").Include(
                "~/Content/Lib/jquery-2.0.0.js",
                "~/Content/Lib/jquery-ui.js"));

            bundles.Add(new ScriptBundle("~/bundles/Transfer/bootstrap").Include(
                "~/Content/Lib/bootstrap.js"));

            bundles.Add(new ScriptBundle("~/bundles/Transfer/jquery-addon-siacu").Include(
                "~/Content/Lib/jquery.dataTables.min.js",
                "~/Content/Lib/jquery.dataTables.select.js",
                "~/Content/Lib/Lib/jquery.blockUI.js",
                "~/Content/Lib/Lib/jquery.numeric.js",
                "~/Content/Lib/Lib/dataTables.bootstrap.min.js",
                "~/Content/Lib/bootstrap-datepicker.js",
                "~/Content/Lib/moment.js",
                "~/Content/Lib/moment-es.js"
            ));

            bundles.Add(new ScriptBundle("~/bundles/Transfer/Claro-siacu")
                .Include("~/Content/Scripts/polyfill.js",
                         "~/Content/Scripts/ReingApp.js"));

            bundles.Add(new ScriptBundle("~/bundles/Transfer/Script")
             .Include("~/Areas/Transfer/Scripts/Transfer.js"));

            bundles.Add(new ScriptBundle("~/bundles/Transfer/Redirect")
           .Include("~/Areas/Transfer/Scripts/Bridge.js"));

            bundles.Add(new ScriptBundle("~/bundles/Content/Lib/BloqueoF12")
                .Include("~/Content/Lib/BloqueoF12.js"));

            BundleTable.EnableOptimizations = true;
        }
    }
}