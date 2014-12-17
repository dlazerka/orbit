import java.io._
import scala.io.{BufferedSource, Source}

/**
 * @author Dzmitry Lazerka
 */
object PreDeploy {
	def main(args: Array[String]) {
		val workingDir = new File(System.getProperty("user.dir"))
		traverse(workingDir)
	}

	def traverse(dir: File): Unit = {
		val nodes = dir.listFiles()

		nodes.filter(node => node.isFile && node.getName.endsWith(".html"))
			.map(processHtml)

		nodes.filter(_.isDirectory)
			.map(traverse)
	}

	def processHtml(f: File): Unit = {
		assume(f.length() < Integer.MAX_VALUE)
		assume(f.canRead)
		val source = Source.fromFile(f, "UTF-8", f.length().toInt)
		val content = source.mkString
		source.close()

		var r = """(<script\s+type="text/javascript"\s+src=)"([^"]+)"\s+cdn="([^"]+)"""".r
		val newContent = r.replaceAllIn(content, """$1"$3"""")

		val writer = new FileWriter(f)
		writer.write(newContent)
		writer.close()
	}
}
