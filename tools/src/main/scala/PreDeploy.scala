import java.io._

import scala.io.Source

/**
 * Processes all .html files:
 * Searches for strings like
 * {{{
 * &lt;script src="lib/jquery.js" cdn="//googleapis.cdn.com/jquery.min.js"&gt;
 * }}}
 * and replaces `src` with `cdn`.
 *
 * @author Dzmitry Lazerka
 */
object PreDeploy {
	val cdnRegexp = """(src=)"([^"]+)"\s+cdn="([^"]+)"""".r

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

		val newContent = cdnRegexp.replaceAllIn(content, """$1"$3"""")

		val writer = new FileWriter(f)
		writer.write(newContent)
		writer.close()
	}
}
