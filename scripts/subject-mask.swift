import CoreImage
import Foundation
import Vision

// Строит маску «товар / фон» (белое — товар) через Apple Vision. Нужен macOS 14+.
// Сборка: swiftc -O scripts/subject-mask.swift -o /tmp/subject-mask
let arguments = CommandLine.arguments
guard arguments.count == 3 else {
    FileHandle.standardError.write("usage: mask <input> <output.png>\n".data(using: .utf8)!)
    exit(2)
}
let handler = VNImageRequestHandler(url: URL(fileURLWithPath: arguments[1]), options: [:])
let request = VNGenerateForegroundInstanceMaskRequest()
try handler.perform([request])
guard let observation = request.results?.first else {
    FileHandle.standardError.write("no foreground found\n".data(using: .utf8)!)
    exit(1)
}
let buffer = try observation.generateScaledMaskForImage(forInstances: observation.allInstances, from: handler)
let mask = CIImage(cvPixelBuffer: buffer)
let gray = CGColorSpace(name: CGColorSpace.linearGray)!
try CIContext().writePNGRepresentation(of: mask, to: URL(fileURLWithPath: arguments[2]), format: .L8, colorSpace: gray)
print("instances: \(observation.allInstances.count)")
