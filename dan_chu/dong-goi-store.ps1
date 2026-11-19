# Đóng gói bản cài thành gói MSIX để nộp lên Microsoft Store.
#
# Chạy sau khi đã có bản dựng release:
#
#   $env:CARGO_HOME="<dự án>\.toolchain\cargo"; $env:RUSTUP_HOME="<dự án>\.toolchain\rustup"
#   $env:TMP=$env:TEMP="<dự án>\.toolchain\tmp"; $env:npm_config_cache="<dự án>\.toolchain\tmp\npm-cache"
#   $env:PATH="<dự án>\.toolchain\cargo\bin;$env:PATH"
#   npm run tauri build
#   pwsh -NoProfile -File dan_chu\dong-goi-store.ps1 -IdentityName "..." -Publisher "CN=..."
#
# Hai tham số IdentityName và Publisher **phải** lấy đúng từ Partner Center sau khi anh giữ tên
# ứng dụng (Partner Center > sản phẩm > Product identity). Sai hai giá trị đó thì gói bị từ chối
# ngay ở bước tải lên, và thông báo lỗi không nói rõ là sai chỗ nào.
#
# Script không tải gì, không cài gì, không ký gói. Gói nộp Store không cần chữ ký: Store ký khi
# duyệt. Nó chỉ dựng một thư mục tạm, gọi makeappx, rồi in ra đường dẫn, dung lượng và sha256.
param(
    [string]$IdentityName = "XinChaoTamHon.ChaoEmCuaSoTamHon",
    [string]$Publisher = "CN=00000000-0000-0000-0000-000000000000",
    [string]$PublisherDisplayName = "Xin chào tâm hồn",
    [string]$Version,
    [string]$Out
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$exe = Join-Path $root "src-tauri\target\release\chao-em-cua-so-tam-hon.exe"
$icons = Join-Path $root "src-tauri\icons"
$makeappx = "C:\Program Files (x86)\Windows Kits\10\App Certification Kit\makeappx.exe"

if (-not (Test-Path $exe)) {
    throw "Chưa có bản dựng release: $exe - chạy 'npm run tauri build' trước."
}
if (-not (Test-Path $makeappx)) {
    throw "Không thấy makeappx.exe: $makeappx"
}
if (-not $Version) {
    $Version = (Get-Content (Join-Path $root "package.json") -Raw | ConvertFrom-Json).version
}
# MSIX đòi đủ bốn phần: 2.1.3 -> 2.1.3.0
$fourPart = if (($Version -split '\.').Count -eq 3) { "$Version.0" } else { $Version }
if (-not $Out) {
    $Out = Join-Path $root "tai_lieu\ChaoEmCuaSoTamHon-$Version-x64.msix"
}

$layout = Join-Path $root ".toolchain\tmp\msix-layout"
if (Test-Path $layout) { Remove-Item $layout -Recurse -Force }
New-Item -ItemType Directory -Path (Join-Path $layout "Assets") -Force | Out-Null

Copy-Item $exe (Join-Path $layout "chao-em-cua-so-tam-hon.exe")
foreach ($pair in @(
        @{ from = "StoreLogo.png"; to = "StoreLogo.png" },
        @{ from = "Square44x44Logo.png"; to = "Square44x44Logo.png" },
        @{ from = "Square150x150Logo.png"; to = "Square150x150Logo.png" },
        @{ from = "Square310x310Logo.png"; to = "Square310x310Logo.png" }
    )) {
    Copy-Item (Join-Path $icons $pair.from) (Join-Path $layout "Assets\$($pair.to)")
}

# Ô ngang 310x150 là bắt buộc khi có ô vuông 310: makeappx từ chối manifest nếu thiếu, và nó nói
# đúng như vậy. Ảnh dựng từ ô 150 vuông, đặt giữa, nền trong suốt - không thêm một tệp nguồn mới
# vào dự án cho một ô chỉ hiện trên Store.
Add-Type -AssemblyName System.Drawing
$square = [System.Drawing.Image]::FromFile((Join-Path $icons "Square150x150Logo.png"))
$wide = New-Object System.Drawing.Bitmap 310, 150
$g = [System.Drawing.Graphics]::FromImage($wide)
$g.Clear([System.Drawing.Color]::Transparent)
$g.DrawImage($square, [int]((310 - 150) / 2), 0, 150, 150)
$g.Dispose()
$wide.Save((Join-Path $layout "Assets\Wide310x150Logo.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$wide.Dispose()
$square.Dispose()

$manifest = @"
<?xml version="1.0" encoding="utf-8"?>
<Package
  xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10"
  xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10"
  xmlns:rescap="http://schemas.microsoft.com/appx/manifest/foundation/windows10/restrictedcapabilities"
  IgnorableNamespaces="uap rescap">

  <Identity Name="$IdentityName" Publisher="$Publisher" Version="$fourPart" ProcessorArchitecture="x64" />

  <Properties>
    <DisplayName>Chào em cửa sổ tâm hồn</DisplayName>
    <PublisherDisplayName>$PublisherDisplayName</PublisherDisplayName>
    <Logo>Assets\StoreLogo.png</Logo>
    <Description>Nhắc nghỉ mắt theo quy tắc 20-20-20: mỗi 20 phút nhìn ra xa trong 20 giây.</Description>
  </Properties>

  <Dependencies>
    <TargetDeviceFamily Name="Windows.Desktop" MinVersion="10.0.17763.0" MaxVersionTested="10.0.26100.0" />
  </Dependencies>

  <Resources>
    <Resource Language="vi-VN" />
  </Resources>

  <Applications>
    <Application Id="App" Executable="chao-em-cua-so-tam-hon.exe" EntryPoint="Windows.FullTrustApplication">
      <uap:VisualElements
        DisplayName="Chào em cửa sổ tâm hồn"
        Description="Nhắc nghỉ mắt theo quy tắc 20-20-20"
        BackgroundColor="transparent"
        Square150x150Logo="Assets\Square150x150Logo.png"
        Square44x44Logo="Assets\Square44x44Logo.png">
        <uap:DefaultTile Square310x310Logo="Assets\Square310x310Logo.png" Wide310x150Logo="Assets\Wide310x150Logo.png" ShortName="Cửa sổ tâm hồn" />
      </uap:VisualElements>
    </Application>
  </Applications>

  <Capabilities>
    <rescap:Capability Name="runFullTrust" />
  </Capabilities>
</Package>
"@

# makeappx đọc UTF-8; ghi không BOM để khỏi phải đoán nó chấp nhận hay không.
[System.IO.File]::WriteAllText((Join-Path $layout "AppxManifest.xml"), $manifest, (New-Object System.Text.UTF8Encoding($false)))

if (Test-Path $Out) { Remove-Item $Out -Force }
& $makeappx pack /d $layout /p $Out /o
if ($LASTEXITCODE -ne 0) { throw "makeappx trả về $LASTEXITCODE" }

$item = Get-Item $Out
"MSIX      {0}" -f $item.FullName
"Size      {0:N0} B ({1:N1} MB)" -f $item.Length, ($item.Length / 1MB)
"Version   {0}" -f $fourPart
"Identity  {0}" -f $IdentityName
"Publisher {0}" -f $Publisher
"sha256    {0}" -f (Get-FileHash $Out -Algorithm SHA256).Hash
