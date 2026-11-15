{
  inputs,
  lib,
  pkgs,
  ...
}:

{
  overlays = [ inputs.js-toolchain-overlay.overlays.default ];

  languages.javascript = {
    enable = true;
    package = pkgs.node-bin.latest;
    pnpm = {
      enable = true;
      package = pkgs.pnpm-bin.fromPackageJSON ./package.json;
    };
    lsp.enable = false;
  };

  env.NVIM_VUE_TYPESCRIPT_PLUGIN_PATH = "${pkgs.vue-language-server}/lib/language-tools/packages/language-server";

  packages = with pkgs; [
    prettier
    prettierd
    vscode-langservers-extracted
    vtsls
    vue-language-server
    yaml-language-server
  ];
}
