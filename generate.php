<?php
error_reporting(E_ALL);
//ini_set('display_errors', 0);
set_time_limit(0);
$json = json_decode(file_get_contents('raw.json') , true);
usort($json['data'],function ($a, $b){ return strcmp($a["category"], $b["category"]);});

foreach($json['data'] as $j => $categories) {
  foreach($categories['charts'] as $z => $charts) {
    foreach($charts['past'] as $p => $past) {

      if ($past['data']) {
        $pairs = array_map(function ($data) {
          return [$data[0], $data[1], $data[2], intval(explode('-', $data[0]) [1]) , intval(explode('-', $data[0]) [2]) ];
        }, $past['data']);
        $oldest = min(array_column($pairs, 0)) - 1;
        $newest = max(array_column($pairs, 0));
        $min = min(array_column($pairs, 1));
        $max = max(array_column($pairs, 1));
        $first = reset($pairs);
        $last = end($pairs);

        // check if exponential or linear graph
        if ($past['scale'] == 'exp') {
          $coef = exponentialRegression($pairs, $oldest);
          $scale = 'exp';
        } else
        if ($past['scale'] == 'lin') {
          $coef = linearRegression($pairs, $oldest);
          $scale = 'lin';
        }

        if ($p == 0) { //first past data
          if ($scale == 'exp') {
            if ($coef[1] < 1) {
              $json['data'][$j]['charts'][$z]['insight'] = '/2: ' . round($coef[1] * 2 * 12) . ' months';
              $json['data'][$j]['charts'][$z]['growth'] = - round((1 - $coef[1]) * 100, 2) . '%';
            }
            else {
              $json['data'][$j]['charts'][$z]['insight'] = '2X: ' . round(2 / $coef[1] * 12) . ' months';
              $json['data'][$j]['charts'][$z]['growth'] = round($coef[1] * 100, 2) . '%';
            }
          }
          else
          if ($scale == 'lin') {
            if ($coef[0] < 0) {
              $json['data'][$j]['charts'][$z]['insight'] = round($coef[0], 2) . $past['unit'][0] . ' per year';
            }
            else {
              $json['data'][$j]['charts'][$z]['insight'] = '+' . round($coef[0], 2) . $past['unit'][0] . ' per year';
            }

            $json['data'][$j]['charts'][$z]['growth'] = round(($last[1] - $first[1]) / $first[1] * 100 / ($newest - $oldest - 1)) . '%';
          }
        }

        if ($past['future']) {
          $future = [];
          $future[] = array(
            $last[0],
            $last[1],
            $last[2]
          );
          $i = $v = $newest + 1;
          $endYear = date('Y', strtotime('+20 years'));
          $passOnce = 0;
          while ($i < $endYear) {
            if ($scale == 'exp') {
              $futureVal = $coef[0] * pow($coef[1], $v - $oldest - 2); //tweak to make output work... need a exponential library
            }
            else
            if ($scale == 'lin') {
              $futureVal = $coef[0] * ($v - $oldest) + $coef[1];
            }

            if (($past['max']) && ($futureVal >= $past['max'])) {

              $future[] = array(
                $i . "-" . $last[3] . "-" . $last[4],
                number_format($past['max'], 5, '.', '')
              );
              $i++;

              if ($past['max'] != 100) break;

            } else if (($futureVal >= $max) || ($futureVal <= $min)) { //check to see the value is higher or lower
              if (number_format($futureVal, 5) > 0) {
                $future[] = array(
                  $i . "-" . $last[3] . "-" . $last[4],
                  number_format($futureVal, 5, '.', '')
                );
              }

              $i++;
            }


            $v++;
          }

          $json['data'][$j]['charts'][$z]['future'][$p]['name'] = $past['name'];
          $json['data'][$j]['charts'][$z]['future'][$p]['unit'] = $past['unit'];
          $json['data'][$j]['charts'][$z]['future'][$p]['data'] = $future;
        }
      }

      usort($json['data'][$j]['charts'][$z]['future'],
      function ($a, $b)
      {
        return strcmp($a["name"], $b["name"]);
      });
    }

    usort($json['data'][$j]['charts'][$z]['past'],
    function ($a, $b)
    {
      return strcmp($a["name"], $b["name"]);
    });
  }

  usort($json['data'][$j]['charts'],
  function ($a, $b)
  {
    return strcmp($a["title"], $b["title"]);
  });
}

$fp = fopen('data.json', 'w');
fwrite($fp, json_encode($json, JSON_NUMERIC_CHECK));
fclose($fp);

function linearRegression($pairs, $oldest)
{
  $x = $y = 0;
  $Sx = $Sy = $Sxx = $Sxy = $Syy = 0.0;
  $n = count($pairs);
  foreach($pairs as $pair) {
    list($x, $y) = $pair;
    if ($oldest) $x = $x - $oldest;
    $Sx+= $x;
    $Sy+= $y;
    $Sxx+= pow($x, 2);
    $Sxy+= $x * $y;
    $Syy+= pow($y, 2);
  }

  $m = (($n * $Sxy) - ($Sx * $Sy)) / (($n * $Sxx) - pow($Sx, 2));
  $b = ($Sy - ($m * $Sx)) / $n;
  $r = (($n * $Sxy) - ($Sx * $Sy)) / (sqrt(($n * ($Sxx)) - pow($Sx, 2)) * sqrt(($n * $Syy) - pow($Sy, 2)));
  return array(
    $m,
    $b,
    $r
  );
}

function exponentialRegression($pairs, $oldest)
{
  array_walk($pairs,
  function (&$value, $k, $data)
  {
    $value = array(
      $value[0] - $data,
      log($value[1], 10)
    );
  }

  , $oldest);
  list($m, $b, $r) = linearRegression($pairs, false);
  $r = pow(10, $m);
  $A = pow(10, $b);
  return array(
    $A,
    $r
  );
}

?>
