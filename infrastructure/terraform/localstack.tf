resource "aws_s3_bucket" "exports" {
  bucket = var.s3_bucket_name
}

resource "aws_s3_bucket_versioning" "exports" {
  bucket = aws_s3_bucket.exports.id
  versioning_configuration {
    status = "Enabled"
  }
}

output "s3_bucket_arn" {
  value = aws_s3_bucket.exports.arn
}
