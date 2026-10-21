$pptxPath = "C:\Users\Admin\.gemini\antigravity\scratch\smart_city_cybersecurity\SURAKSHA_CITY_Enhanced.pptx"
$pdfPath  = "C:\Users\Admin\.gemini\antigravity\scratch\smart_city_cybersecurity\SURAKSHA_CITY_Enhanced.pdf"
$outDir   = "C:\Users\Admin\.gemini\antigravity\scratch\smart_city_cybersecurity"

$ppt = New-Object -ComObject PowerPoint.Application
try {
    $pres = $ppt.Presentations.Open($pptxPath, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse)
    $pres.SaveCopyAs($pdfPath, 32)
    for ($i = 1; $i -le $pres.Slides.Count; $i++) {
        $slideImg = Join-Path $outDir "slide_$i.png"
        $pres.Slides.Item($i).Export($slideImg, "PNG", 1920, 1080)
    }
    $pres.Close()
    Write-Host "Export success!"
}
finally {
    $ppt.Quit()
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}
