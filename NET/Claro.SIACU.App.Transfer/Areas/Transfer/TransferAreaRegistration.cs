using System.Web.Mvc;
using System.Web.Optimization;

namespace Claro.SIACU.App.Transfer.Areas.Transfer
{
    public class TransferAreaRegistration : AreaRegistration
    {
        public override string AreaName
        {
            get
            {
                return "Transfer";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context)
        {
            context.MapRoute(
                "Transfer_default",
                "Transfer/{controller}/{action}/{id}",
                new { action = "Index", id = UrlParameter.Optional }
            );

            RegisterBundles(BundleTable.Bundles);
        }

        private void RegisterBundles(BundleCollection bundles)
        {
            Claro.SIACU.App.Transfer.Areas.Transfer.Utils.BundleConfig.RegisterBundles(BundleTable.Bundles);
        }
    }
}